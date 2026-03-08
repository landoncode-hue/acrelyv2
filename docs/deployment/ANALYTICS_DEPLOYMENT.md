# Analytics Migrations Deployment Guide

## Migrations to Deploy

There are 2 new migration files that need to be applied:

1. **20251214120000_analytics_cache.sql** - Materialized views for performance
2. **20251214120100_additional_analytics_functions.sql** - Customer lifecycle RPC function

## Deployment Options

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of each migration file in order:
   - First: `supabase/migrations/20251214120000_analytics_cache.sql`
   - Second: `supabase/migrations/20251214120100_additional_analytics_functions.sql`
5. Run each migration

### Option 2: Supabase CLI (If Linked)

```bash
# Link your project (one-time setup)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all pending migrations
npx supabase db push
```

### Option 3: Direct Database Connection

If you have direct database access:

```bash
# Using psql
psql "$DATABASE_URL" -f supabase/migrations/20251214120000_analytics_cache.sql
psql "$DATABASE_URL" -f supabase/migrations/20251214120100_additional_analytics_functions.sql
```

## What These Migrations Do

### Migration 1: Analytics Cache (Materialized Views)
Creates 3 materialized views for fast analytics:
- `mv_revenue_summary` - Monthly revenue aggregations
- `mv_agent_performance` - Agent performance metrics
- `mv_customer_balances` - Customer balance summaries

Also creates:
- `refresh_analytics_cache()` - Function to refresh all views
- `get_analytics_cache_status()` - Function to check cache status

### Migration 2: Additional Analytics Functions
Adds:
- `get_customer_lifecycle_data()` - RPC function for customer status distribution

## After Deployment

### 1. Verify Migrations Applied

Run this query in SQL Editor to check:

```sql
-- Check if materialized views exist
SELECT schemaname, matviewname 
FROM pg_matviews 
WHERE matviewname LIKE 'mv_%';

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('refresh_analytics_cache', 'get_analytics_cache_status', 'get_customer_lifecycle_data');
```

Expected results:
- 3 materialized views
- 3 functions

### 2. Manually Refresh Analytics Cache

After deployment, refresh the materialized views:

```sql
SELECT public.refresh_analytics_cache();
```

You should see: `NOTICE: Analytics cache refreshed successfully at [timestamp]`

### 3. Check Cache Status

```sql
SELECT * FROM public.get_analytics_cache_status();
```

This will show:
- View name
- Last refreshed timestamp
- Row count

## When to Refresh Cache

The materialized views cache analytics data for performance. Refresh them:

- **After deployment** - Initial data load
- **When needed** - When you want updated analytics (e.g., end of day, weekly)
- **Manually** - Call `refresh_analytics_cache()` anytime

```sql
-- Refresh all analytics caches
SELECT public.refresh_analytics_cache();
```

## Troubleshooting

### Error: "materialized view already exists"
The migrations use `IF NOT EXISTS`, so this shouldn't happen. If it does, the views are already created.

### Error: "permission denied"
Make sure you're running as a user with sufficient permissions (postgres role or service_role).

### Views are empty
Run `refresh_analytics_cache()` to populate them with data.

### Performance is slow
The initial refresh might take a few seconds depending on data volume. Subsequent refreshes are faster with `CONCURRENTLY` option.

## Next Steps

After deploying migrations:
1. ✅ Verify migrations applied successfully
2. ✅ Refresh analytics cache
3. ✅ Test dashboards with different user roles
4. ✅ Verify RBAC enforcement

---

**Note**: These migrations are safe to run - they only create read-only views and functions. They don't modify any existing data.
