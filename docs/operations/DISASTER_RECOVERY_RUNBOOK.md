# Disaster Recovery Runbook

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| System Administrator | TBD | TBD | TBD |
| Database Administrator | TBD | TBD | TBD |
| CEO/MD | TBD | TBD | TBD |
| Supabase Support | - | - | support@supabase.com |

---

## Incident Classification

### P0 - Critical (Complete System Failure)
- **Definition**: Complete database loss, system inaccessible
- **Response Time**: Immediate (< 15 minutes)
- **RTO Target**: 1 hour
- **RPO Target**: 2 minutes (with PITR)

### P1 - High (Partial Data Loss)
- **Definition**: Partial data corruption, specific tables affected
- **Response Time**: < 30 minutes
- **RTO Target**: 2 hours
- **RPO Target**: 2 minutes (with PITR)

### P2 - Medium (Backup System Failure)
- **Definition**: Backup system not functioning, no data loss yet
- **Response Time**: < 2 hours
- **RTO Target**: 4 hours
- **RPO Target**: N/A

---

## Recovery Procedures

### Procedure 1: Full Database Restoration (P0)

**When to use**: Complete database loss or corruption

**Prerequisites**:
- Access to Supabase Dashboard
- Latest backup file or PITR timestamp
- Service role key

**Steps**:

1. **Assess the Situation** (5 minutes)
   ```bash
   # Check database connectivity
   psql "$DATABASE_URL" -c "SELECT version();"
   
   # If connection fails, proceed with restoration
   ```

2. **Notify Stakeholders** (2 minutes)
   - Send incident notification to all sysadmins
   - Alert CEO/MD of system downtime
   - Post status update (if applicable)

3. **Identify Latest Valid Backup** (3 minutes)
   - Login to Acrely dashboard: `/dashboard/backups`
   - Identify latest successful backup
   - Note backup ID and timestamp
   - OR determine PITR timestamp if more recent

4. **Initiate Restoration** (10 minutes)
   
   **Option A: Using Latest Backup**
   ```bash
   # Download backup from Supabase Storage
   supabase storage download backups/[backup-file].sql.gz
   
   # Extract backup
   gunzip [backup-file].sql.gz
   
   # Restore to new project (recommended)
   psql "$NEW_DATABASE_URL" < [backup-file].sql
   ```

   **Option B: Using PITR (if enabled)**
   - Go to Supabase Dashboard → Database → Backups
   - Click "Restore to a new project"
   - Select PITR timestamp
   - Choose target time (e.g., 5 minutes before incident)
   - Click "Restore"
   - Wait for restoration (typically 10-30 minutes)

5. **Verify Restoration** (10 minutes)
   ```sql
   -- Check row counts for critical tables
   SELECT 
       'profiles' as table_name, COUNT(*) as row_count FROM profiles
   UNION ALL
   SELECT 'customers', COUNT(*) FROM customers
   UNION ALL
   SELECT 'allocations', COUNT(*) FROM allocations
   UNION ALL
   SELECT 'payments', COUNT(*) FROM payments;
   
   -- Check latest records
   SELECT MAX(created_at) FROM payments;
   SELECT MAX(created_at) FROM allocations;
   ```

6. **Update Application Configuration** (5 minutes)
   ```bash
   # Update environment variables to point to restored database
   # In Vercel Dashboard or .env
   DATABASE_URL=[new-database-url]
   NEXT_PUBLIC_SUPABASE_URL=[new-supabase-url]
   ```

7. **Test Critical Flows** (15 minutes)
   - Login as different roles (sysadmin, frontdesk, customer)
   - Create test allocation
   - Record test payment
   - Verify data persistence

8. **Switch Traffic** (5 minutes)
   - Update DNS if necessary
   - Redeploy application with new database URL
   - Monitor error logs

9. **Post-Incident** (30 minutes)
   - Document incident timeline
   - Calculate actual RTO/RPO
   - Identify root cause
   - Update runbook if needed

**Total Estimated Time**: 45-60 minutes

---

### Procedure 2: Point-in-Time Recovery (P1)

**When to use**: Accidental data deletion, corruption at known time

**Steps**:

1. **Identify Incident Time** (5 minutes)
   - Determine exact time of data loss/corruption
   - Choose recovery point (5-10 minutes before incident)

2. **Verify PITR Enabled**
   - Check Supabase Dashboard → Database → Backups
   - Confirm PITR is active

3. **Restore to New Project** (30 minutes)
   - Supabase Dashboard → Database → Backups
   - Click "Restore to a new project"
   - Select PITR option
   - Enter target timestamp
   - Wait for restoration

4. **Extract Missing Data** (20 minutes)
   ```sql
   -- Connect to restored database
   -- Export missing/corrupted data
   COPY (SELECT * FROM [affected_table] WHERE ...) TO '/tmp/recovered_data.csv' CSV HEADER;
   ```

5. **Import to Production** (15 minutes)
   ```sql
   -- Connect to production database
   -- Import recovered data
   COPY [affected_table] FROM '/tmp/recovered_data.csv' CSV HEADER;
   ```

6. **Verify Data Integrity** (10 minutes)
   - Check row counts
   - Verify relationships
   - Test affected functionality

**Total Estimated Time**: 1-2 hours

---

### Procedure 3: Backup System Recovery (P2)

**When to use**: Backup system not functioning

**Steps**:

1. **Check Backup Health** (5 minutes)
   - Navigate to `/dashboard/backups`
   - Review health status
   - Check last backup time

2. **Trigger Manual Backup** (2 minutes)
   - Click "Create Backup" button
   - Wait for completion

3. **If Manual Backup Fails** (30 minutes)
   ```bash
   # Run backup script manually
   cd /Users/lordkay/Development/acrely
   ./scripts/backup_db.sh production
   
   # Check logs
   cat backups/backup.log
   ```

4. **Check Edge Function Logs** (10 minutes)
   - Supabase Dashboard → Edge Functions → backup-database
   - Review error logs
   - Check for permission issues

5. **Verify Cron Jobs** (10 minutes)
   ```sql
   -- Check cron job status
   SELECT * FROM cron.job WHERE jobname LIKE '%backup%';
   
   -- Check cron job runs
   SELECT * FROM cron.job_run_details 
   WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE '%backup%')
   ORDER BY start_time DESC LIMIT 10;
   ```

6. **Fix and Re-enable** (20 minutes)
   - Address identified issues
   - Test backup manually
   - Verify cron schedule

**Total Estimated Time**: 1-2 hours

---

## Communication Templates

### Incident Notification (P0)

**Subject**: [P0] Database Incident - System Restoration in Progress

**Body**:
```
INCIDENT ALERT - P0

Status: IN PROGRESS
Incident Time: [TIMESTAMP]
Affected Systems: Acrely Database
Impact: System unavailable

Actions Taken:
- Incident confirmed at [TIME]
- Restoration initiated at [TIME]
- ETA for recovery: [TIME]

Next Update: [TIME]

Contact: [SYSADMIN NAME/EMAIL]
```

### Resolution Notification

**Subject**: [RESOLVED] Database Incident - System Restored

**Body**:
```
INCIDENT RESOLVED

Incident Duration: [DURATION]
Root Cause: [BRIEF DESCRIPTION]
Data Loss: [NONE / MINIMAL / DESCRIPTION]

Recovery Metrics:
- RTO: [ACTUAL TIME]
- RPO: [ACTUAL DATA LOSS]

System Status: OPERATIONAL

Post-Incident Review: Scheduled for [DATE/TIME]

Contact: [SYSADMIN NAME/EMAIL]
```

---

## Post-Incident Review Template

**Incident ID**: [UNIQUE ID]  
**Date**: [DATE]  
**Severity**: [P0/P1/P2]  
**Duration**: [HOURS:MINUTES]

### Timeline
| Time | Event |
|------|-------|
| [TIME] | Incident detected |
| [TIME] | Response initiated |
| [TIME] | Restoration started |
| [TIME] | System recovered |
| [TIME] | Verified operational |

### Metrics
- **RTO Target**: 1 hour
- **RTO Actual**: [ACTUAL]
- **RPO Target**: 2 minutes
- **RPO Actual**: [ACTUAL]

### Root Cause
[Detailed description of what caused the incident]

### What Went Well
- [Item 1]
- [Item 2]

### What Went Wrong
- [Item 1]
- [Item 2]

### Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action 1] | [Name] | [Date] | [ ] |
| [Action 2] | [Name] | [Date] | [ ] |

### Lessons Learned
[Key takeaways and improvements for future incidents]

---

## RTO/RPO Tracking

### Target Metrics
- **RTO (Recovery Time Objective)**: 1 hour
- **RPO (Recovery Point Objective)**: 2 minutes (with PITR)

### Historical Performance
| Date | Incident Type | RTO Actual | RPO Actual | Notes |
|------|---------------|------------|------------|-------|
| - | - | - | - | No incidents yet |

---

## Maintenance

### Weekly
- [ ] Review backup logs for failures
- [ ] Verify latest backup completed successfully
- [ ] Check backup health status

### Monthly
- [ ] Test backup restoration to staging
- [ ] Review backup storage costs
- [ ] Verify cloud sync working

### Quarterly
- [ ] Conduct full DR drill
- [ ] Update emergency contacts
- [ ] Review and update runbook
- [ ] Test PITR restoration

### Annually
- [ ] Full security audit
- [ ] Review RTO/RPO targets
- [ ] Update disaster recovery plan
- [ ] Train new team members

---

## Appendix

### Useful Commands

```bash
# Check database size
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# List all tables with row counts
psql "$DATABASE_URL" -c "
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
       n_live_tup AS rows
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Check active connections
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"

# Manual backup
./scripts/backup_db.sh production

# Verify backup integrity
gunzip -t backups/[backup-file].sql.gz
shasum -a 256 -c backups/[backup-file].sql.gz.sha256
```

### Supabase Support

**Email**: support@supabase.com  
**Dashboard**: https://app.supabase.com  
**Documentation**: https://supabase.com/docs/guides/platform/backups  
**Status Page**: https://status.supabase.com

---

**Last Updated**: [DATE]  
**Version**: 1.0  
**Owner**: System Administrator
