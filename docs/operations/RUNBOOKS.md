# Acrely Operational Runbooks

**Last Updated**: 2025-12-29  
**Owner**: @lordkay  
**Purpose**: Step-by-step procedures for critical operations and incident response

---

## Table of Contents

1. [Backup & Recovery](#backup--recovery)
2. [Failed Background Jobs](#failed-background-jobs)
3. [Data Cleanup Verification](#data-cleanup-verification)
4. [Incident Response](#incident-response)
5. [Deployment Rollback](#deployment-rollback)
6. [Database Maintenance](#database-maintenance)

---

## Backup & Recovery

### Restore from Backup

**When to use**: Database corruption, accidental data deletion, disaster recovery

**Prerequisites**:
- Supabase CLI installed
- Service role key available
- Backup file identified

**Steps**:

1. **Identify the backup to restore**
   ```sql
   SELECT * FROM backup_logs 
   WHERE status = 'completed' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

2. **Download backup file**
   ```bash
   # Get backup file URL from backup_logs.file_path
   supabase storage download backups/[backup-file-name].sql
   ```

3. **Verify backup integrity**
   ```bash
   # Check file size and format
   ls -lh [backup-file-name].sql
   head -n 20 [backup-file-name].sql
   ```

4. **Create restoration point** (current state backup)
   ```bash
   supabase db dump -f pre-restore-backup-$(date +%Y%m%d-%H%M%S).sql
   ```

5. **Stop application** (prevent writes during restore)
   ```bash
   # In Vercel dashboard, set environment variable
   MAINTENANCE_MODE=true
   
   # Redeploy
   vercel --prod
   ```

6. **Restore database**
   ```bash
   # Connect to database
   psql [DATABASE_URL]
   
   # Drop and recreate schema (CAUTION!)
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   
   # Restore from backup
   \i [backup-file-name].sql
   ```

7. **Verify restoration**
   ```sql
   -- Check critical tables
   SELECT COUNT(*) FROM customers;
   SELECT COUNT(*) FROM allocations;
   SELECT COUNT(*) FROM payments;
   
   -- Check recent data
   SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
   ```

8. **Re-enable application**
   ```bash
   # Remove maintenance mode
   MAINTENANCE_MODE=false
   vercel --prod
   ```

9. **Monitor for issues**
   - Check error logs
   - Verify user logins
   - Test critical workflows

10. **Document incident**
    - Record in incident log
    - Update team
    - Schedule post-mortem

**Rollback**: Use pre-restore backup created in step 4

---

### Verify Backup Integrity

**When to use**: Weekly verification, before major changes

**Steps**:

1. **Run verification function**
   ```bash
   curl -X POST https://[PROJECT-REF].supabase.co/functions/v1/verify-backups \
     -H "Authorization: Bearer [SERVICE-ROLE-KEY]"
   ```

2. **Check verification results**
   ```sql
   SELECT * FROM backup_logs 
   WHERE operation = 'verify' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

3. **Review any failures**
   ```sql
   SELECT * FROM backup_logs 
   WHERE operation = 'verify' 
   AND status = 'failed' 
   ORDER BY created_at DESC;
   ```

4. **Alert if failures found**
   - Notify admin team
   - Investigate root cause
   - Re-run backup if needed

---

## Failed Background Jobs

### Diagnose Failed Cron Job

**When to use**: Cron job hasn't run, admin alert received

**Steps**:

1. **Check cron job status**
   ```sql
   SELECT * FROM cron.job WHERE jobname LIKE '%[job-name]%';
   ```

2. **Review recent executions**
   ```sql
   SELECT 
     j.jobname,
     r.start_time,
     r.end_time,
     r.status,
     r.return_message
   FROM cron.job_run_details r
   JOIN cron.job j ON j.jobid = r.jobid
   WHERE j.jobname = '[job-name]'
   ORDER BY r.start_time DESC
   LIMIT 10;
   ```

3. **Check Edge Function logs**
   - Open Supabase Dashboard
   - Navigate to Edge Functions → [function-name]
   - Review logs for errors

4. **Identify error type**
   - **Timeout**: Increase function timeout
   - **Permission**: Check service role key
   - **Logic error**: Review function code
   - **External API**: Check third-party service status

5. **Manual execution** (if safe)
   ```bash
   curl -X POST https://[PROJECT-REF].supabase.co/functions/v1/[function-name] \
     -H "Authorization: Bearer [SERVICE-ROLE-KEY]" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

6. **Fix root cause**
   - Deploy code fix if needed
   - Update environment variables
   - Adjust cron schedule

7. **Monitor next execution**
   - Wait for next scheduled run
   - Verify success
   - Check logs

8. **Document resolution**
   - Update incident log
   - Add to known issues if recurring

---

### Recover from Failed Message Delivery

**When to use**: Communication logs show failed deliveries

**Steps**:

1. **Identify failed messages**
   ```sql
   SELECT * FROM communication_logs 
   WHERE status = 'failed' 
   AND created_at > NOW() - INTERVAL '24 hours'
   ORDER BY created_at DESC;
   ```

2. **Categorize failures**
   - **Invalid recipient**: Update customer contact info
   - **Provider error**: Check Resend/Termii status
   - **Validation error**: Fix template or data
   - **Rate limit**: Wait and retry

3. **Check scheduled retries**
   ```sql
   SELECT * FROM scheduled_communications 
   WHERE status = 'pending' 
   AND related_log_id IN (SELECT id FROM communication_logs WHERE status = 'failed');
   ```

4. **Manual retry** (if needed)
   ```typescript
   // In Supabase SQL Editor or via API
   SELECT process_scheduled_communication('[schedule-id]');
   ```

5. **Update customer if critical**
   - Create in-app notification
   - Manual phone call for urgent matters
   - Email via alternative method

6. **Fix root cause**
   - Update contact information
   - Fix template issues
   - Increase rate limits

---

## Data Cleanup Verification

### Verify Cleanup Job Execution

**When to use**: After cleanup job runs, monthly audit

**Steps**:

1. **Check cleanup logs**
   ```sql
   SELECT * FROM backup_logs 
   WHERE operation = 'data_cleanup' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

2. **Review deletion counts**
   ```sql
   -- Check meta field for deletion counts
   SELECT 
     created_at,
     meta->>'records_deleted' as deleted_count,
     meta->>'tables_cleaned' as tables,
     status
   FROM backup_logs 
   WHERE operation = 'data_cleanup'
   ORDER BY created_at DESC;
   ```

3. **Verify no active records deleted**
   ```sql
   -- Ensure no recent customer data was deleted
   SELECT COUNT(*) FROM customers 
   WHERE created_at > NOW() - INTERVAL '90 days';
   
   -- Should match expected count
   ```

4. **Check retention compliance**
   ```sql
   -- No soft-deleted records older than retention period
   SELECT COUNT(*) FROM customers 
   WHERE deleted_at < NOW() - INTERVAL '90 days';
   -- Should return 0
   
   SELECT COUNT(*) FROM notifications 
   WHERE is_read = true 
   AND created_at < NOW() - INTERVAL '90 days';
   -- Should return 0
   ```

5. **Alert if anomalies found**
   - Unexpected deletion counts
   - Active records deleted
   - Cleanup didn't run

---

## Incident Response

### Critical System Outage

**Severity**: P0 - Complete system down

**Steps**:

1. **Immediate actions** (first 5 minutes)
   - Acknowledge incident
   - Check Vercel status dashboard
   - Check Supabase status dashboard
   - Enable maintenance mode if needed

2. **Assess impact**
   - Can users log in?
   - Can staff access dashboard?
   - Are payments being processed?
   - Are communications being sent?

3. **Identify root cause**
   - Check deployment logs
   - Review error tracking
   - Check database connectivity
   - Review recent changes

4. **Mitigation**
   - Rollback recent deployment (see Deployment Rollback)
   - Restore from backup if data corruption
   - Scale resources if capacity issue
   - Contact support if provider issue

5. **Communication**
   - Update status page
   - Notify stakeholders
   - Provide ETA for resolution

6. **Resolution**
   - Implement fix
   - Verify system stability
   - Monitor for 30 minutes

7. **Post-incident**
   - Document timeline
   - Schedule post-mortem
   - Implement preventive measures

---

### Data Breach or Security Incident

**Severity**: P0 - Security compromise

**Steps**:

1. **Immediate containment**
   - Revoke compromised credentials
   - Enable maintenance mode
   - Preserve logs and evidence

2. **Assess scope**
   - What data was accessed?
   - How many users affected?
   - Was data exfiltrated?

3. **Notification**
   - Notify legal team
   - Prepare user notification
   - Contact authorities if required

4. **Investigation**
   - Review audit logs
   - Check access patterns
   - Identify attack vector

5. **Remediation**
   - Patch vulnerability
   - Reset affected credentials
   - Implement additional security measures

6. **Recovery**
   - Restore normal operations
   - Monitor for further attempts
   - Update security policies

---

## Deployment Rollback

### Rollback Vercel Deployment

**When to use**: Critical bug in production, system instability

**Steps**:

1. **Identify previous working deployment**
   ```bash
   # List recent deployments
   vercel ls
   ```

2. **Rollback via Vercel dashboard**
   - Open Vercel dashboard
   - Navigate to project → Deployments
   - Find last known good deployment
   - Click "..." → "Promote to Production"

3. **Or rollback via CLI**
   ```bash
   vercel rollback [deployment-url]
   ```

4. **Verify rollback**
   - Check application loads
   - Test critical workflows
   - Review error logs

5. **Communicate**
   - Notify team of rollback
   - Document issue
   - Plan fix for next deployment

---

### Rollback Database Migration

**When to use**: Migration caused data issues, performance problems

**Steps**:

1. **Stop application** (prevent further writes)
   ```bash
   MAINTENANCE_MODE=true
   vercel --prod
   ```

2. **Identify migration to rollback**
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations 
   ORDER BY version DESC 
   LIMIT 10;
   ```

3. **Run down migration**
   ```bash
   supabase migration down [migration-name]
   ```

4. **Verify rollback**
   ```sql
   -- Check schema changes reverted
   \d [table-name]
   ```

5. **Re-enable application**
   ```bash
   MAINTENANCE_MODE=false
   vercel --prod
   ```

6. **Fix migration**
   - Update migration file
   - Test in local environment
   - Re-deploy when ready

---

## Database Maintenance

### Optimize Database Performance

**When to use**: Slow queries, high database load

**Steps**:

1. **Identify slow queries**
   ```sql
   SELECT 
     query,
     calls,
     total_time,
     mean_time,
     max_time
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 20;
   ```

2. **Analyze table statistics**
   ```sql
   SELECT 
     schemaname,
     tablename,
     n_live_tup,
     n_dead_tup,
     last_vacuum,
     last_autovacuum
   FROM pg_stat_user_tables 
   ORDER BY n_dead_tup DESC;
   ```

3. **Run VACUUM if needed**
   ```sql
   VACUUM ANALYZE [table-name];
   ```

4. **Check index usage**
   ```sql
   SELECT 
     schemaname,
     tablename,
     indexname,
     idx_scan,
     idx_tup_read,
     idx_tup_fetch
   FROM pg_stat_user_indexes 
   WHERE idx_scan = 0 
   ORDER BY pg_relation_size(indexrelid) DESC;
   ```

5. **Add missing indexes**
   ```sql
   -- Based on slow query analysis
   CREATE INDEX CONCURRENTLY idx_[table]_[column] 
   ON [table]([column]);
   ```

6. **Monitor improvements**
   - Re-run slow query analysis
   - Check application performance
   - Monitor database metrics

---

### Clean Up Test Data

**When to use**: After testing, before production launch

**Steps**:

1. **Identify test data**
   ```sql
   SELECT * FROM customers WHERE email LIKE '%@test.%';
   SELECT * FROM estates WHERE name LIKE 'Test%';
   SELECT * FROM leads WHERE email LIKE '%test%';
   ```

2. **Verify is_test flag** (if implemented)
   ```sql
   SELECT COUNT(*) FROM customers WHERE is_test = true;
   SELECT COUNT(*) FROM estates WHERE is_test = true;
   ```

3. **Create backup before deletion**
   ```bash
   supabase db dump -f pre-cleanup-$(date +%Y%m%d).sql
   ```

4. **Delete test data** (CAUTION!)
   ```sql
   -- Start transaction
   BEGIN;
   
   -- Delete test records
   DELETE FROM customers WHERE is_test = true;
   DELETE FROM estates WHERE is_test = true;
   DELETE FROM leads WHERE is_test = true;
   
   -- Verify counts
   SELECT COUNT(*) FROM customers;
   SELECT COUNT(*) FROM estates;
   
   -- Commit if correct
   COMMIT;
   -- Or rollback if wrong
   -- ROLLBACK;
   ```

5. **Verify application**
   - Check dashboard loads
   - Verify real data intact
   - Test critical workflows

---

## Emergency Contacts

- **System Owner**: @lordkay
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Resend Support**: support@resend.com
- **Termii Support**: support@termii.com

---

## Incident Log Template

```markdown
## Incident: [Brief Description]

**Date**: YYYY-MM-DD  
**Time**: HH:MM UTC  
**Severity**: P0/P1/P2/P3  
**Status**: Investigating/Mitigating/Resolved  
**Duration**: [Time to resolution]

### Impact
- [What was affected]
- [How many users impacted]
- [What functionality was down]

### Timeline
- HH:MM - Incident detected
- HH:MM - Investigation started
- HH:MM - Root cause identified
- HH:MM - Mitigation applied
- HH:MM - Incident resolved

### Root Cause
[Detailed explanation]

### Resolution
[What was done to fix]

### Prevention
[What will prevent this in future]

### Action Items
- [ ] [Action 1]
- [ ] [Action 2]
```

---

**End of Runbooks**
