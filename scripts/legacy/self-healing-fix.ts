import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.SUPABASE_DB_URL || "postgresql://postgres:Arelius@db.wvhnuiajtvoajjhumzxe.supabase.co:5432/postgres");

async function applyFixes() {
    console.log("Applying fixes to database...");

    try {
        // Fix 1: get_estate_analytics RPC
        await sql`
        CREATE OR REPLACE FUNCTION get_estate_analytics(p_estate_id UUID)
        RETURNS JSON AS $$
        DECLARE
          v_result JSON;
        BEGIN
          SELECT json_build_object(
            -- Plot metrics
            'total_plots', COUNT(p.id),
            'available_plots', COUNT(*) FILTER (WHERE p.status = 'available'),
            'reserved_plots', COUNT(*) FILTER (WHERE p.status = 'reserved'),
            'sold_plots', COUNT(*) FILTER (WHERE p.status = 'sold'),
            'partially_allocated_plots', COUNT(*) FILTER (WHERE p.status = 'partially_allocated'),
            
            -- Occupancy metrics
            'occupancy_percentage', ROUND(
              (COUNT(*) FILTER (WHERE p.status != 'available')::NUMERIC / 
               NULLIF(COUNT(p.id), 0)) * 100, 2
            ),
            'sold_percentage', ROUND(
              (COUNT(*) FILTER (WHERE p.status = 'sold')::NUMERIC / 
               NULLIF(COUNT(p.id), 0)) * 100, 2
            ),
            
            -- Financial metrics
            'total_revenue', COALESCE(SUM(pay.amount) FILTER (
              WHERE pay.status IN ('verified', 'confirmed')
            ), 0),
            'outstanding_balance', COALESCE(SUM(
              CASE 
                WHEN a.status = 'approved' THEN
                  COALESCE(a.total_price, 0) - COALESCE(a.amount_paid, 0)
                ELSE 0 
              END
            ), 0),
            'average_plot_price', ROUND(AVG(p.price), 2),
            
            -- Customer metrics
            'total_customers', COUNT(DISTINCT a.customer_id) FILTER (
              WHERE a.status = 'approved'
            ),
            
            -- Time metrics
            'average_days_to_sell', ROUND(AVG(
              EXTRACT(EPOCH FROM (a.allocation_date - p.created_at)) / 86400
            ) FILTER (WHERE a.status = 'approved'), 1),
            
            -- Estate info
            'estate_name', e.name,
            'estate_code', e.code,
            'base_price', e.price,
            'status', e.status,
            'created_at', e.created_at
          ) INTO v_result
          FROM estates e
          LEFT JOIN plots p ON p.estate_id = e.id
          LEFT JOIN allocations a ON a.plot_id = p.id
          LEFT JOIN payments pay ON pay.allocation_id = a.id
          WHERE e.id = p_estate_id
          GROUP BY e.id, e.name, e.code, e.price, e.status, e.created_at;

          RETURN v_result;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        `;
        console.log("Fixed get_estate_analytics RPC.");

        // Fix 2: Plot Status Sync Trigger
        await sql`
        CREATE OR REPLACE FUNCTION public.sync_plot_status_on_allocation()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Handle INSERT (New Allocation)
            IF (TG_OP = 'INSERT') THEN
                IF NEW.plot_id IS NOT NULL THEN
                    IF NEW.status IN ('draft', 'pending_approval') THEN
                        UPDATE public.plots SET status = 'reserved' WHERE id = NEW.plot_id;
                    ELSIF NEW.status = 'approved' THEN
                        UPDATE public.plots SET status = 'sold' WHERE id = NEW.plot_id;
                    END IF;
                END IF;
                RETURN NEW;
            END IF;

            -- Handle UPDATE
            IF (TG_OP = 'UPDATE') THEN
                -- Case 1: Plot changed
                IF OLD.plot_id IS DISTINCT FROM NEW.plot_id THEN
                    -- Release old plot
                    IF OLD.plot_id IS NOT NULL THEN
                        UPDATE public.plots SET status = 'available' WHERE id = OLD.plot_id;
                    END IF;
                    -- Reserve or Sell new plot
                    IF NEW.plot_id IS NOT NULL THEN
                        IF NEW.status IN ('draft', 'pending_approval') THEN
                            UPDATE public.plots SET status = 'reserved' WHERE id = NEW.plot_id;
                        ELSIF NEW.status = 'approved' THEN
                            UPDATE public.plots SET status = 'sold' WHERE id = NEW.plot_id;
                        END IF;
                    END IF;
                    RETURN NEW;
                END IF;

                -- Case 2: Status changed (same plot)
                IF OLD.status IS DISTINCT FROM NEW.status AND NEW.plot_id IS NOT NULL THEN
                    IF NEW.status = 'approved' THEN
                        UPDATE public.plots SET status = 'sold' WHERE id = NEW.plot_id;
                    ELSIF NEW.status IN ('draft', 'pending_approval') THEN
                        UPDATE public.plots SET status = 'reserved' WHERE id = NEW.plot_id;
                    ELSIF NEW.status IN ('rejected', 'cancelled') THEN
                        UPDATE public.plots SET status = 'available' WHERE id = NEW.plot_id;
                    END IF;
                END IF;
                RETURN NEW;
            END IF;

            -- Handle DELETE
            IF (TG_OP = 'DELETE') THEN
                IF OLD.plot_id IS NOT NULL THEN
                    UPDATE public.plots SET status = 'available' WHERE id = OLD.plot_id;
                END IF;
                RETURN OLD;
            END IF;

            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        DROP TRIGGER IF EXISTS trigger_sync_plot_status ON public.allocations;
        CREATE TRIGGER trigger_sync_plot_status
        AFTER INSERT OR UPDATE OR DELETE ON public.allocations
        FOR EACH ROW EXECUTE FUNCTION public.sync_plot_status_on_allocation();
        `;
        console.log("Added sync_plot_status_on_allocation trigger.");

        // Backfill: Update current plot statuses based on allocations
        await sql`
        UPDATE public.plots p
        SET status = 'reserved'
        FROM public.allocations a
        WHERE a.plot_id = p.id AND a.status IN ('draft', 'pending_approval');
        `;
        await sql`
        UPDATE public.plots p
        SET status = 'sold'
        FROM public.allocations a
        WHERE a.plot_id = p.id AND a.status = 'approved';
        `;
        console.log("Backfilled plot statuses.");

    } catch (err) {
        console.error("Error applying fixes:", err);
    } finally {
        await sql.end();
    }
}

applyFixes();
