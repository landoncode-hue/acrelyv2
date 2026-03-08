import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

async function updateRPCs() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔄 Updating RPCs to support "confirmed" status...');

    const execKpisSql = `
    CREATE OR REPLACE FUNCTION public.get_executive_kpis(
        p_date_from TIMESTAMPTZ DEFAULT NULL,
        p_date_to TIMESTAMPTZ DEFAULT NULL
    )
    RETURNS TABLE (
        total_revenue_collected NUMERIC,
        outstanding_balance NUMERIC,
        overdue_balance NUMERIC,
        total_plots BIGINT,
        plots_sold BIGINT,
        plots_available BIGINT,
        active_allocations BIGINT,
        pending_allocations BIGINT,
        overdue_customers BIGINT,
        agent_performance_index NUMERIC,
        total_customers BIGINT,
        avg_customer_lifetime_value NUMERIC
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        v_user_role user_role;
    BEGIN
        SELECT role INTO v_user_role FROM public.profiles WHERE id = auth.uid();
        
        RETURN QUERY
        WITH agent_stats AS (
            SELECT 
                p.id,
                COUNT(DISTINCT l.id) as lead_count,
                COUNT(DISTINCT a.id) as allocation_count
            FROM public.profiles p
            LEFT JOIN public.leads l ON p.id = l.assigned_to
            LEFT JOIN public.allocations a ON p.id = a.sales_agent_id
            WHERE p.role = 'agent' AND p.is_staff = true
            GROUP BY p.id
        )
        SELECT
            COALESCE((
                SELECT SUM(p_pay.amount)
                FROM public.payments p_pay
                WHERE p_pay.status IN ('verified', 'confirmed')
                AND (p_date_from IS NULL OR p_pay.payment_date >= p_date_from)
                AND (p_date_to IS NULL OR p_pay.payment_date <= p_date_to)
            ), 0) AS total_revenue_collected,
            
            COALESCE((
                SELECT SUM(a.total_price - a.amount_paid)
                FROM public.allocations a
                WHERE a.status IN ('approved', 'pending_approval')
            ), 0) AS outstanding_balance,

            COALESCE((
                SELECT SUM(ppi.amount_due - ppi.amount_paid)
                FROM public.payment_plan_installments ppi
                JOIN public.payment_plans pp ON ppi.payment_plan_id = pp.id
                JOIN public.allocations a ON pp.allocation_id = a.id
                WHERE ppi.due_date < NOW() 
                AND ppi.status != 'paid'
            ), 0) AS overdue_balance,
            
            COALESCE((
                SELECT COUNT(*)
                FROM public.plots
            ), 0) AS total_plots,

            COALESCE((
                SELECT COUNT(DISTINCT a.plot_id)
                FROM public.allocations a
                WHERE a.status IN ('approved', 'completed')
                AND a.plot_id IS NOT NULL
                AND (p_date_from IS NULL OR a.created_at >= p_date_from)
                AND (p_date_to IS NULL OR a.created_at <= p_date_to)
            ), 0) AS plots_sold,

            COALESCE((
                SELECT COUNT(*)
                FROM public.plots p
                WHERE p.status = 'available'
            ), 0) AS plots_available,
            
            COALESCE((
                SELECT COUNT(*)
                FROM public.allocations a
                WHERE a.status = 'approved'
            ), 0) AS active_allocations,

            COALESCE((
                SELECT COUNT(*)
                FROM public.allocations a
                WHERE a.status IN ('pending_approval', 'draft')
            ), 0) AS pending_allocations,
            
            COALESCE((
                SELECT COUNT(DISTINCT c.id)
                FROM public.customers c
                JOIN public.allocations a ON c.id = a.customer_id
                JOIN public.payment_plans pp ON a.id = pp.allocation_id
                JOIN public.payment_plan_installments ppi ON pp.id = ppi.payment_plan_id
                WHERE ppi.status = 'overdue'
            ), 0) AS overdue_customers,
            
            COALESCE((
                SELECT AVG(
                    CASE 
                        WHEN lead_count > 0 
                        THEN (allocation_count::NUMERIC / lead_count::NUMERIC) * 100 
                        ELSE 0 
                    END
                )
                FROM agent_stats
            ), 0) AS agent_performance_index,
            
            COALESCE((SELECT COUNT(*) FROM public.customers), 0) AS total_customers,
            
            COALESCE((
                SELECT AVG(lifetime_value)
                FROM public.customer_lifecycle_view
                WHERE lifetime_value > 0
            ), 0) AS avg_customer_lifetime_value;
    END;
    $$;`;

    const frontdeskMetricsSql = `
    CREATE OR REPLACE FUNCTION public.get_frontdesk_metrics(
        p_date TIMESTAMPTZ DEFAULT NOW()
    )
    RETURNS TABLE (
        payments_today_count BIGINT,
        payments_today_amount NUMERIC,
        pending_approvals_count BIGINT,
        overdue_installments_count BIGINT,
        overdue_installments_amount NUMERIC,
        receipts_generated_today BIGINT,
        failed_messages_count BIGINT,
        customers_needing_followup BIGINT
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        v_user_role user_role;
        v_day_start TIMESTAMPTZ;
        v_day_end TIMESTAMPTZ;
    BEGIN
        SELECT role INTO v_user_role FROM public.profiles WHERE id = auth.uid();
        
        IF v_user_role NOT IN ('sysadmin', 'ceo', 'md', 'frontdesk') THEN
            RAISE EXCEPTION 'Unauthorized: Only staff can access frontdesk metrics';
        END IF;

        v_day_start := DATE_TRUNC('day', p_date);
        v_day_end := v_day_start + INTERVAL '1 day';

        RETURN QUERY
        SELECT
            COALESCE((
                SELECT COUNT(*)
                FROM public.payments
                WHERE created_at >= v_day_start AND created_at < v_day_end
            ), 0)::BIGINT AS payments_today_count,
            
            COALESCE((
                SELECT SUM(amount)
                FROM public.payments
                WHERE created_at >= v_day_start AND created_at < v_day_end
                AND status IN ('verified', 'confirmed')
            ), 0) AS payments_today_amount,
            
            COALESCE((
                SELECT COUNT(*)
                FROM public.allocations
                WHERE status = 'pending_approval'
            ), 0)::BIGINT AS pending_approvals_count,
            
            COALESCE((
                SELECT COUNT(*)
                FROM public.payment_plan_installments
                WHERE status = 'overdue'
            ), 0)::BIGINT AS overdue_installments_count,
            
            COALESCE((
                SELECT SUM(amount_due - amount_paid)
                FROM public.payment_plan_installments
                WHERE status = 'overdue'
            ), 0) AS overdue_installments_amount,
            
            COALESCE((
                SELECT COUNT(*)
                FROM public.payments
                WHERE receipt_status = 'generated'
                AND created_at >= v_day_start AND created_at < v_day_end
            ), 0)::BIGINT AS receipts_generated_today,
            
            0::BIGINT AS failed_messages_count,
            0::BIGINT AS customers_needing_followup;
    END;
    $$;`;

    const { error: err1 } = await supabase.rpc('execute_sql', { sql: execKpisSql });
    if (err1) console.error('Error updating get_executive_kpis:', err1);
    else console.log('✅ get_executive_kpis updated');

    const { error: err2 } = await supabase.rpc('execute_sql', { sql: frontdeskMetricsSql });
    if (err2) console.error('Error updating get_frontdesk_metrics:', err2);
    else console.log('✅ get_frontdesk_metrics updated');
}

updateRPCs();
