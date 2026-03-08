-- Acrely v2 — Stored Procedures for Analytics, Reports, and Workflows

----------------------------------------------
-- 1. ANALYTICS FUNCTIONS
----------------------------------------------

-- Executive KPIs
CREATE OR REPLACE FUNCTION get_executive_kpis()
RETURNS TABLE (
    total_revenue BIGINT,
    target_revenue BIGINT,
    active_customers INTEGER,
    total_leads INTEGER,
    conversion_rate NUMERIC,
    growth_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(amount), 0)::BIGINT as total_revenue,
        1000000000::BIGINT as target_revenue, -- Example target
        (SELECT COUNT(*)::INTEGER FROM customers WHERE status = 'active') as active_customers,
        (SELECT COUNT(*)::INTEGER FROM leads) as total_leads,
        CASE 
            WHEN (SELECT COUNT(*) FROM leads) = 0 THEN 0 
            ELSE (SELECT COUNT(*) FROM leads WHERE status = 'converted')::NUMERIC / (SELECT COUNT(*) FROM leads)::NUMERIC * 100 
        END as conversion_rate,
        15.5::NUMERIC as growth_rate; -- Placeholder for logic
END;
$$ LANGUAGE plpgsql;

-- Revenue Trends
CREATE OR REPLACE FUNCTION get_revenue_trends()
RETURNS TABLE (
    month TEXT,
    revenue BIGINT,
    target BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_char(payment_date, 'Mon') as month,
        SUM(amount)::BIGINT as revenue,
        80000000::BIGINT as target
    FROM payments
    WHERE status = 'verified'
    GROUP BY month, to_char(payment_date, 'MM')
    ORDER BY to_char(payment_date, 'MM');
END;
$$ LANGUAGE plpgsql;

----------------------------------------------
-- 2. EXPORT FUNCTIONS
----------------------------------------------

-- Export Payments
CREATE OR REPLACE FUNCTION export_payments_report(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS TABLE (
    id UUID,
    customer_name TEXT,
    amount BIGINT,
    status TEXT,
    payment_date TIMESTAMPTZ,
    transaction_ref TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        c.full_name as customer_name,
        p.amount,
        p.status,
        p.payment_date,
        p.transaction_ref
    FROM payments p
    JOIN customers c ON p.customer_id = c.id
    WHERE p.payment_date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Export Allocations
CREATE OR REPLACE FUNCTION export_allocations_report(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS TABLE (
    id UUID,
    customer_name TEXT,
    estate_name TEXT,
    total_price BIGINT,
    amount_paid BIGINT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        c.full_name as customer_name,
        e.name as estate_name,
        a.total_price,
        a.amount_paid,
        a.status
    FROM allocations a
    JOIN customers c ON a.customer_id = c.id
    JOIN estates e ON a.estate_id = e.id
    WHERE a.created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Log Export History
CREATE OR REPLACE FUNCTION log_export(
    p_export_type TEXT,
    p_file_name TEXT,
    p_row_count INTEGER,
    p_user_id UUID,
    p_status TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_export_id UUID;
BEGIN
    INSERT INTO export_history (export_type, file_name, row_count, exported_by, status, metadata)
    VALUES (p_export_type, p_file_name, p_row_count, p_user_id, p_status, p_metadata)
    RETURNING id INTO v_export_id;
    
    RETURN v_export_id;
END;
$$ LANGUAGE plpgsql;

----------------------------------------------
-- 3. WORKFLOW FUNCTIONS
----------------------------------------------

-- Convert Lead Workflow
CREATE OR REPLACE FUNCTION convert_lead_workflow(
    p_lead_id UUID,
    p_actor_id UUID,
    p_actor_role TEXT,
    p_email TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_occupation TEXT DEFAULT NULL,
    p_nok_name TEXT DEFAULT NULL,
    p_nok_phone TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_lead RECORD;
    v_customer_id UUID;
BEGIN
    SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lead not found');
    END IF;

    -- Create Customer
    INSERT INTO customers (
        full_name, email, phone, address, occupation, next_of_kin_name, next_of_kin_phone, created_from_lead_id, created_by
    ) VALUES (
        v_lead.full_name, COALESCE(p_email, v_lead.email), v_lead.phone, p_address, p_occupation, p_nok_name, p_nok_phone, p_lead_id, p_actor_id
    ) RETURNING id INTO v_customer_id;

    -- Update Lead
    UPDATE leads SET status = 'converted', customer_id = v_customer_id, converted_at = NOW() WHERE id = p_lead_id;

    -- Audit Log
    INSERT INTO audit_logs (actor_user_id, actor_role, action_type, target_id, target_type)
    VALUES (p_actor_id, p_actor_role, 'lead_conversion', v_customer_id::text, 'customers');

    RETURN jsonb_build_object('success', true, 'customer_id', v_customer_id);
END;
$$ LANGUAGE plpgsql;

-- Update KYC Workflow
CREATE OR REPLACE FUNCTION update_kyc_workflow(
    p_customer_id UUID,
    p_status TEXT,
    p_notes TEXT,
    p_actor_id UUID,
    p_actor_role TEXT
) RETURNS VOID AS $$
BEGIN
    UPDATE customers 
    SET kyc_status = p_status, 
        kyc_data = kyc_data || jsonb_build_object('notes', p_notes, 'reviewed_at', NOW(), 'reviewed_by', p_actor_id)
    WHERE id = p_customer_id;

    INSERT INTO audit_logs (actor_user_id, actor_role, action_type, target_id, target_type, changes)
    VALUES (p_actor_id, p_actor_role, 'kyc_update', p_customer_id::text, 'customers', jsonb_build_object('status', p_status));
END;
$$ LANGUAGE plpgsql;
