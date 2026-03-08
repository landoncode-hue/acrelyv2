-- ⚠️ DANGER: This will wipe EVERYTHING including Auth Users ⚠️

-- 1. Fast wipe of public tables (Cascades to dependents)
TRUNCATE TABLE 
    public.audit_logs,
    public.profiles,
    public.estates,
    public.plots,
    public.allocations,
    public.customers,
    public.agents,
    public.payments,
    public.commission_history,
    public.withdrawal_requests,
    public.notifications
RESTART IDENTITY CASCADE;

-- 2. Delete all Auth Users (orphans profiles usually, but we truncated profiles above)
-- Note: This requires appropriate permissions in the SQL Editor
DELETE FROM auth.users;

-- 3. Verify
SELECT count(*) as audit_logs_count FROM public.audit_logs;
SELECT count(*) as profiles_count FROM public.profiles;
SELECT count(*) as users_count FROM auth.users;
