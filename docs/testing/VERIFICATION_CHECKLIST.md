# Verification Checklist - Product Standards Compliance

**Date**: 2025-12-31  
**Purpose**: Verify successful deployment and operation of compliance features  
**Production URL**: https://acrely-v2-nxu5nnxql-landon-digitals-projects.vercel.app

---

## 📊 Quick Status

| Phase | Status | Details |
|-------|--------|---------|
| **Deployment** | ✅ Complete | All migrations, functions, and cron jobs deployed |
| **Data Hygiene Audit** | ⏳ Pending | Requires service role key from Supabase |
| **First Cleanup Run** | ⏳ Scheduled | Will run tomorrow at 3 AM UTC |
| **Final Verification** | ⏳ Pending | Complete after first cleanup |

---

## ✅ Pre-Deployment Verification (COMPLETE)

- [x] 5 database migrations applied to production
- [x] 2 Edge Functions deployed (data-cleanup, job-monitor)
- [x] Vercel Cron configured (daily at 3 AM UTC)
- [x] CRON_SECRET environment variable set
- [x] TypeScript build errors fixed (7 errors resolved)
- [x] Vercel deployment completed successfully
- [x] **Production URL**: https://acrely-v2-nxu5nnxql-landon-digitals-projects.vercel.app

**Deployment Date**: 2025-12-31  
**Status**: ✅ LIVE IN PRODUCTION

---

## 🔍 Post-Deployment Verification

### 1. Database Schema Verification

**Run these queries in Supabase SQL Editor:**

```sql
-- Check retention policies table exists and has data
SELECT * FROM retention_policies ORDER BY table_name;
-- Expected: 5 rows (customers, notifications, scheduled_communications, communication_logs, audit_logs)

-- Verify is_test flags added to major tables
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE column_name = 'is_test' 
AND table_schema = 'public';
-- Expected: customers, estates, leads, allocations, payments

-- Check correlation_id in audit_logs
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
AND column_name = 'correlation_id';
-- Expected: 1 row (correlation_id, text)

-- Verify staff offboarding fields
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('offboarded_at', 'offboarding_reason');
-- Expected: 2 rows

-- Check template versioning fields
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'communication_templates' 
AND column_name IN ('version', 'deprecated_at', 'replaced_by_id');
-- Expected: 3 rows
```

**Checklist:**
- [ ] Retention policies table exists with 5 policies
- [ ] is_test flags present on 5 major tables
- [ ] correlation_id column in audit_logs
- [ ] Offboarding fields in profiles table
- [ ] Template versioning fields in communication_templates

---

### 2. Edge Functions Verification

**Test data-cleanup function:**

```bash
curl -X POST https://wvhnuiajtvoajjhumzxe.supabase.co/functions/v1/data-cleanup \
  -H "Authorization: Bearer [SERVICE-ROLE-KEY]" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "success": true,
  "results": [
    {"job_name": "cleanup_soft_deleted_customers", "records_deleted": 0, "executed_at": "..."},
    {"job_name": "cleanup_old_notifications", "records_deleted": 0, "executed_at": "..."},
    ...
  ],
  "total_deleted": 0
}
```

**Test job-monitor function:**

```bash
curl -X POST https://wvhnuiajtvoajjhumzxe.supabase.co/functions/v1/job-monitor \
  -H "Authorization: Bearer [SERVICE-ROLE-KEY]" \
  -H "Content-Type: application/json"
```

**Checklist:**
- [ ] data-cleanup function responds successfully
- [ ] job-monitor function responds successfully
- [ ] Functions log to backup_logs table

---

### 3. Vercel Cron Verification

**Check Vercel Dashboard:**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Navigate to **Cron Jobs** tab

**Checklist:**
- [ ] Cron job "cleanup" visible in dashboard
- [ ] Schedule shows "0 3 * * *" (daily at 3 AM UTC)
- [ ] Status shows "Enabled"

**Test API route:**

```bash
curl -X GET https://your-app.vercel.app/api/cron/cleanup \
  -H "Authorization: Bearer sO0cAT2lNktRNN35sgC2kSgBaQKmkhV2GXB5ty3qDYY="
```

**Checklist:**
- [ ] API route responds successfully
- [ ] Cleanup executes via API route
- [ ] Results logged to backup_logs

---

### 4. Monitor First Cleanup Execution

**Wait until after 3 AM UTC, then check:**

```sql
-- Check cleanup execution logs
SELECT * FROM backup_logs 
WHERE operation = 'data_cleanup'
ORDER BY created_at DESC 
LIMIT 5;

-- Check what was deleted
SELECT 
  created_at,
  status,
  meta->>'total_deleted' as total_deleted,
  meta->'jobs' as job_details
FROM backup_logs 
WHERE operation = 'data_cleanup'
ORDER BY created_at DESC 
LIMIT 1;
```

**Checklist:**
- [ ] Cleanup job executed at 3 AM UTC
- [ ] Status is 'completed'
- [ ] Records deleted count is reasonable
- [ ] No errors in meta field

---

### 5. Admin Notifications Verification

**Check admin notifications:**

```sql
-- Check for cleanup notifications
SELECT * FROM notifications 
WHERE title LIKE '%Cleanup%'
ORDER BY created_at DESC 
LIMIT 5;

-- Check for job monitoring alerts
SELECT * FROM notifications 
WHERE title LIKE '%Job Issues%'
ORDER BY created_at DESC 
LIMIT 5;
```

**Checklist:**
- [ ] Admin notifications created for cleanup completion
- [ ] Notifications sent to sysadmin users
- [ ] Notification messages contain relevant details

---

### 6. Data Hygiene Audit

**Run the audit script:**

```bash
# Get service role key from Supabase Dashboard → Settings → API
SUPABASE_URL=https://wvhnuiajtvoajjhumzxe.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY] \
npm run audit:data-hygiene
```

**Review the report:**

```bash
cat data-hygiene-audit-report.json
```

**Checklist:**
- [ ] Audit script runs successfully
- [ ] Report generated (data-hygiene-audit-report.json)
- [ ] No CRITICAL severity findings
- [ ] Test data properly flagged with is_test
- [ ] No test emails in production (@test.com, @example.com)

---

### 7. Correlation ID Verification

**Make a test request and check logs:**

```sql
-- Check recent audit logs for correlation IDs
SELECT 
  id,
  action_type,
  correlation_id,
  created_at
FROM audit_logs 
WHERE correlation_id IS NOT NULL
ORDER BY created_at DESC 
LIMIT 10;
```

**In browser:**
1. Open DevTools → Network tab
2. Make any request to your app
3. Check response headers for `x-correlation-id`

**Checklist:**
- [ ] Correlation IDs present in audit logs
- [ ] Correlation IDs in response headers
- [ ] Same correlation ID across related operations

---

### 8. Stored Procedures Verification

**Test cleanup procedures manually:**

```sql
-- Test soft-deleted customers cleanup (should return 0 if no old records)
SELECT * FROM cleanup_soft_deleted_customers();

-- Test notifications cleanup
SELECT * FROM cleanup_old_notifications();

-- Test scheduled communications cleanup
SELECT * FROM cleanup_scheduled_communications();

-- Test communication logs cleanup
SELECT * FROM cleanup_communication_logs();

-- Test master cleanup function
SELECT * FROM run_all_cleanup_jobs();
```

**Checklist:**
- [ ] All cleanup functions execute without errors
- [ ] Functions return expected structure (deleted_count)
- [ ] Retention periods are respected

---

## 📊 Compliance Score Verification

After all verifications complete, confirm final scores:

| Seal | Target | Status |
|------|--------|--------|
| Lifecycle Completeness | 9/10 | [ ] Verified |
| Failure Handling | 9/10 | [ ] Verified |
| Observability | 10/10 | [ ] Verified |
| Data Hygiene | 9/10 | [ ] Verified |
| Ownership | 8/10 | [ ] Verified |

**Overall Target**: 9.0/10

---

## 🚨 Troubleshooting

### Cleanup Job Not Running

1. Check Vercel Cron logs in dashboard
2. Verify CRON_SECRET matches in API route
3. Test API route manually
4. Check Edge Function logs in Supabase

### No Records Being Deleted

1. Check if old records exist:
   ```sql
   SELECT COUNT(*) FROM customers 
   WHERE deleted_at < NOW() - INTERVAL '90 days';
   ```
2. Verify retention policies are enabled
3. Test cleanup functions manually

### Admin Notifications Not Received

1. Check notifications table for entries
2. Verify sysadmin users exist
3. Check notification creation in Edge Function logs

---

## MCP Connectivity Verification

To double-check the database availability, I used the Supabase MCP server to verify connectivity:

- **Project Visibility**: Confirmed project `Acrelyv5` (`wvhnuiajtvoajjhumzxe`) is active and healthy.
- **Table Listing**: Successfully retrieved the table schema for the `public` schema.
- **Data Access**: Executed a `SELECT count(*) FROM profiles` query which correctly returned **11** records.

> [!NOTE]
> The fact that MCP tools are stable while E2E tests are failing with socket errors suggests that the issue is specific to the high-concurrency/high-frequency request patterns of the Playwright suite (or the local web server's handling of those requests), rather than a general database outage.

## ✅ Sign-Off

Once all items are checked:

- [ ] All database migrations verified
- [ ] All Edge Functions operational
- [ ] Vercel Cron executing successfully
- [ ] First cleanup job completed
- [ ] Data hygiene audit passed
- [ ] Correlation IDs working
- [ ] Admin notifications functional
- [ ] All seals verified at target scores

**Verified by**: _______________  
**Date**: _______________  
**Compliance Score**: 9.0/10 ✅

---

**Next Steps:**
1. Monitor cleanup jobs weekly for first month
2. Run data hygiene audit monthly
3. Review retention policies quarterly
4. Update system documentation as needed
