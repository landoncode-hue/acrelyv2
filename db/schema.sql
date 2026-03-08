-- Acrely v2 — Complete Database Schema
-- Generated from repository types and service layer queries
-- Run this against a fresh PostgreSQL 16 database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

----------------------------------------------
-- 1. PROFILES (users / staff / customers)
----------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT, -- bcrypt hash
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('sysadmin', 'ceo', 'md', 'frontdesk', 'agent', 'customer')),
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    staff_status TEXT CHECK (staff_status IN ('invited', 'active', 'suspended', 'deactivated')),
    employee_id TEXT,
    avatar_url TEXT,
    dicebear_seed TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

----------------------------------------------
-- 2. CUSTOMERS
----------------------------------------------
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    kyc_status TEXT NOT NULL DEFAULT 'not_started' CHECK (kyc_status IN ('not_started', 'pending', 'verified', 'rejected')),
    kyc_data JSONB DEFAULT '{}'::jsonb,
    occupation TEXT,
    next_of_kin_name TEXT,
    next_of_kin_phone TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_from_lead_id UUID,
    created_by UUID REFERENCES profiles(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_status ON customers(status);

----------------------------------------------
-- 3. CUSTOMER PHONE NUMBERS
----------------------------------------------
CREATE TABLE customer_phone_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    label TEXT DEFAULT 'primary',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_customer_phones_customer ON customer_phone_numbers(customer_id);

----------------------------------------------
-- 4. ESTATES
----------------------------------------------
CREATE TABLE estates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    total_plots INTEGER NOT NULL DEFAULT 0,
    available_plots INTEGER NOT NULL DEFAULT 0,
    base_price BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'coming_soon', 'archived')),
    metadata JSONB DEFAULT '{}'::jsonb
);

----------------------------------------------
-- 5. PLOTS
----------------------------------------------
CREATE TABLE plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    plot_number TEXT NOT NULL,
    size_sqm NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'held')),
    price_override BIGINT,
    dimensions TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE (estate_id, plot_number)
);

CREATE INDEX idx_plots_estate ON plots(estate_id);
CREATE INDEX idx_plots_status ON plots(status);

----------------------------------------------
-- 6. LEADS
----------------------------------------------
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'direct',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted', 'lost')),
    assigned_to UUID REFERENCES profiles(id),
    interest TEXT,
    source_detail TEXT,
    next_follow_up_at TIMESTAMPTZ,
    last_contacted_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    lost_reason TEXT,
    lost_at TIMESTAMPTZ,
    customer_id UUID REFERENCES customers(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);

----------------------------------------------
-- 7. ALLOCATIONS
----------------------------------------------
CREATE TABLE allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    estate_id UUID NOT NULL REFERENCES estates(id),
    plot_id UUID NOT NULL REFERENCES plots(id),
    total_price BIGINT NOT NULL,
    amount_paid BIGINT NOT NULL DEFAULT 0,
    balance BIGINT GENERATED ALWAYS AS (total_price - amount_paid) STORED,
    outstanding_balance BIGINT GENERATED ALWAYS AS (total_price - amount_paid) STORED,
    net_price BIGINT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'approved', 'completed', 'cancelled')),
    payment_plan_id UUID,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_allocations_customer ON allocations(customer_id);
CREATE INDEX idx_allocations_estate ON allocations(estate_id);
CREATE INDEX idx_allocations_status ON allocations(status);

----------------------------------------------
-- 8. PAYMENTS
----------------------------------------------
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    allocation_id UUID NOT NULL REFERENCES allocations(id),
    customer_id UUID REFERENCES customers(id),
    amount BIGINT NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    transaction_ref TEXT,
    payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'cash', 'check', 'other')),
    reference_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'cancelled')),
    receipt_status TEXT DEFAULT 'none' CHECK (receipt_status IN ('none', 'generated', 'downloaded')),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_payments_allocation ON payments(allocation_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);

----------------------------------------------
-- 9. PAYMENT PLANS
----------------------------------------------
CREATE TABLE payment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    allocation_id UUID NOT NULL REFERENCES allocations(id),
    total_amount BIGINT NOT NULL,
    deposit_amount BIGINT NOT NULL DEFAULT 0,
    installment_amount BIGINT NOT NULL,
    total_installments INTEGER NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly', 'bi-annual')),
    start_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_payment_plans_allocation ON payment_plans(allocation_id);

----------------------------------------------
-- 10. PAYMENT PLAN INSTALLMENTS
----------------------------------------------
CREATE TABLE payment_plan_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount_due BIGINT NOT NULL,
    amount_paid BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially_paid', 'paid', 'overdue')),
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ
);

CREATE INDEX idx_installments_plan ON payment_plan_installments(payment_plan_id);

----------------------------------------------
-- 11. AGENTS
----------------------------------------------
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    profile_id UUID NOT NULL REFERENCES profiles(id),
    commission_rate NUMERIC NOT NULL DEFAULT 5.0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    bank_name TEXT,
    account_number TEXT,
    account_name TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_agents_profile ON agents(profile_id);
CREATE INDEX idx_agents_status ON agents(status);

----------------------------------------------
-- 12. COMMISSIONS
----------------------------------------------
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    agent_id UUID NOT NULL REFERENCES agents(id),
    allocation_id UUID REFERENCES allocations(id),
    amount BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_commissions_agent ON commissions(agent_id);

----------------------------------------------
-- 13. RECEIPTS
----------------------------------------------
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_id UUID NOT NULL REFERENCES payments(id),
    receipt_number TEXT NOT NULL UNIQUE,
    amount BIGINT NOT NULL,
    customer_id UUID REFERENCES customers(id),
    file_path TEXT,
    checksum TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_receipts_payment ON receipts(payment_id);

----------------------------------------------
-- 14. AUDIT LOGS
----------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_user_id UUID REFERENCES profiles(id),
    actor_role TEXT,
    action_type TEXT NOT NULL,
    target_id TEXT,
    target_type TEXT,
    changes JSONB,
    ip_address TEXT,
    user_agent TEXT,
    correlation_id TEXT
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_action ON audit_logs(action_type);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

----------------------------------------------
-- 15. SYSTEM SETTINGS
----------------------------------------------
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

----------------------------------------------
-- 16. AUTH ATTEMPTS (rate limiting persistence)
----------------------------------------------
CREATE TABLE auth_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (email, ip_address)
);

----------------------------------------------
-- 17. COMMUNICATIONS / LOG
----------------------------------------------
CREATE TABLE communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
    channel TEXT NOT NULL DEFAULT 'email',
    recipient TEXT NOT NULL,
    subject TEXT,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'bounced')),
    sent_by UUID REFERENCES profiles(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_comms_status ON communication_logs(status);

----------------------------------------------
-- 18. COMMUNICATION TEMPLATES
----------------------------------------------
CREATE TABLE communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
    subject TEXT,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

----------------------------------------------
-- 19. COMMUNICATION CAMPAIGNS
----------------------------------------------
CREATE TABLE communication_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    template_id UUID REFERENCES communication_templates(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'cancelled')),
    scheduled_at TIMESTAMPTZ,
    sent_count INTEGER NOT NULL DEFAULT 0,
    total_recipients INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
);

----------------------------------------------
-- 20. APARTMENTS
----------------------------------------------
CREATE TABLE apartments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    price BIGINT NOT NULL DEFAULT 0,
    amenities JSONB DEFAULT '[]'::jsonb,
    media JSONB DEFAULT '{"images":[],"videos":[]}'::jsonb,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
    metadata JSONB DEFAULT '{}'::jsonb
);

----------------------------------------------
-- 21. APPOINTMENTS
----------------------------------------------
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    apartment_id UUID REFERENCES apartments(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

----------------------------------------------
-- 22. SUPPORT TICKETS
----------------------------------------------
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_id UUID REFERENCES customers(id),
    profile_id UUID REFERENCES profiles(id),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES profiles(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

----------------------------------------------
-- 23. EXPORT HISTORY
----------------------------------------------
CREATE TABLE export_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    export_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    row_count INTEGER NOT NULL DEFAULT 0,
    exported_by UUID REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'completed',
    metadata JSONB DEFAULT '{}'::jsonb
);

----------------------------------------------
-- 24. PASSWORD RESET TOKENS
----------------------------------------------
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL
);

----------------------------------------------
-- 25. KYC DOCUMENTS
----------------------------------------------
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('id_card', 'selfie', 'utility_bill', 'other')),
    file_path TEXT NOT NULL,
    file_name TEXT,
    status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'verified', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT
);

CREATE INDEX idx_kyc_customer ON kyc_documents(customer_id);

----------------------------------------------
-- FUNCTIONS: updated_at trigger
----------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'profiles', 'customers', 'estates', 'plots', 'leads',
        'allocations', 'agents', 'apartments', 'appointments',
        'support_tickets'
    ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
            tbl, tbl
        );
    END LOOP;
END;
$$;

----------------------------------------------
-- SEED: Default admin user
----------------------------------------------
INSERT INTO profiles (id, email, full_name, role, is_staff, staff_status, password_hash, email_verified, onboarding_completed)
VALUES (
    uuid_generate_v4(),
    'admin@acrely.com',
    'System Admin',
    'sysadmin',
    TRUE,
    'active',
    -- Default password: 'admin123' (CHANGE IN PRODUCTION)
    -- Will be replaced with bcrypt hash at app startup
    '$2b$10$placeholder',
    TRUE,
    TRUE
);

-- Default system settings
INSERT INTO system_settings (key, value) VALUES
    ('company_name', '"Acrely Properties"'),
    ('company_email', '"info@acrely.com"'),
    ('company_phone', '""'),
    ('currency', '"NGN"'),
    ('receipt_prefix', '"PBHP"');
