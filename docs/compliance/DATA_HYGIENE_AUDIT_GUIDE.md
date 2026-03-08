# Data Hygiene Audit Guide

## Overview

The data hygiene audit script scans your production database for test/seed data, old records, and potential data quality issues.

---

## Prerequisites

1. **Service Role Key**: Get from Supabase Dashboard → Settings → API → Project API keys → `service_role` (secret)
2. **Supabase URL**: `https://wvhnuiajtvoajjhumzxe.supabase.co`

---

## Running the Audit

### Option 1: Command Line (Recommended)

```bash
cd /Users/lordkay/Development/acrely

# Set environment variables and run
SUPABASE_URL=https://wvhnuiajtvoajjhumzxe.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY] \
npm run audit:data-hygiene
```

### Option 2: Using .env File

Create a temporary `.env.audit` file:

```bash
SUPABASE_URL=https://wvhnuiajtvoajjhumzxe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

Then run:

```bash
source .env.audit && npm run audit:data-hygiene
```

---

## What the Audit Checks

### 1. Test Email Patterns
- Emails containing `@test.com`, `@example.com`, `@test.local`
- Emails with "test" in the local part

### 2. Test Name Patterns
- Names starting with "Test"
- Names containing "Seed", "Demo", "Sample"

### 3. Old Soft-Deleted Records
- Customers deleted more than 90 days ago
- Should have been cleaned up by retention policies

### 4. Old Notifications
- Read notifications older than 90 days
- Should have been cleaned up

### 5. Old Communication Logs
- Logs older than 1 year
- Should have been archived/cleaned

### 6. is_test Flag Compliance
- Records that should be flagged as test data
- Ensures test data is properly marked

---

## Understanding the Report

### Severity Levels

- 🔴 **CRITICAL**: Test data in production, immediate action required
- 🟠 **HIGH**: Data hygiene issues, should be addressed soon
- 🟡 **MEDIUM**: Potential issues, review recommended
- 🟢 **LOW**: Informational, no action needed

### Report Format

```json
{
  "summary": {
    "total_issues": 5,
    "critical": 1,
    "high": 2,
    "medium": 1,
    "low": 1
  },
  "findings": [
    {
      "category": "test_emails",
      "severity": "CRITICAL",
      "count": 3,
      "description": "Test email addresses found in customers table",
      "examples": [
        "test@example.com",
        "demo@test.com"
      ],
      "recommendation": "Remove or flag these records with is_test = true"
    }
  ],
  "timestamp": "2025-12-30T12:00:00.000Z"
}
```

---

## Taking Action on Findings

### Critical: Test Emails in Production

```sql
-- Flag test emails
UPDATE customers 
SET is_test = true 
WHERE email LIKE '%@test.%' 
   OR email LIKE '%@example.%';

-- Or delete if appropriate
DELETE FROM customers 
WHERE email LIKE '%@test.%';
```

### High: Old Soft-Deleted Records

```sql
-- Check what would be deleted
SELECT id, full_name, email, deleted_at 
FROM customers 
WHERE deleted_at < NOW() - INTERVAL '90 days'
LIMIT 10;

-- Run cleanup manually
SELECT * FROM cleanup_soft_deleted_customers();
```

### Medium: Old Notifications

```sql
-- Run cleanup
SELECT * FROM cleanup_old_notifications();
```

---

## Audit Schedule

### Initial Audit (Now)
- Run immediately after deployment
- Address all CRITICAL findings
- Plan remediation for HIGH findings

### Monthly Audits
- Run on the 1st of each month
- Review trends
- Adjust retention policies if needed

### Quarterly Reviews
- Deep dive into data quality
- Update audit script if new patterns emerge
- Review and update retention policies

---

## Sample Audit Workflow

1. **Run the audit**:
   ```bash
   npm run audit:data-hygiene
   ```

2. **Review the report**:
   ```bash
   cat data-hygiene-audit-report.json | jq '.'
   ```

3. **Address CRITICAL findings**:
   - Flag or remove test data
   - Verify no production impact

4. **Plan HIGH findings**:
   - Schedule cleanup
   - Test in staging first

5. **Monitor MEDIUM/LOW**:
   - Track trends
   - Adjust policies if recurring

6. **Document actions**:
   - Record what was cleaned
   - Update runbooks if needed

---

## Troubleshooting

### "Missing environment variables" Error

**Solution**: Ensure both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set:

```bash
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### "Permission denied" Error

**Solution**: Use the service role key, not the anon key. Service role key starts with `eyJ...` and has full database access.

### "No issues found" But You Know There's Test Data

**Solution**: The script might need updating. Check:
1. Are test emails using different patterns?
2. Is test data in tables not covered by the script?
3. Update `scripts/data-hygiene-audit.ts` to add new patterns

---

## Extending the Audit

To add new checks, edit `scripts/data-hygiene-audit.ts`:

```typescript
// Add new check
const { data: customCheck } = await supabase
  .from('your_table')
  .select('*')
  .ilike('field', '%pattern%');

if (customCheck && customCheck.length > 0) {
  findings.push({
    category: 'custom_check',
    severity: 'HIGH',
    count: customCheck.length,
    description: 'Your description',
    examples: customCheck.slice(0, 3).map(r => r.field),
    recommendation: 'Your recommendation'
  });
}
```

---

## Best Practices

1. **Never run in production without reviewing first**: Always check the report before taking action
2. **Backup before cleanup**: Create a backup before deleting data
3. **Test in staging**: Test cleanup queries in staging first
4. **Document everything**: Keep a log of what was cleaned and when
5. **Monitor trends**: Track if certain issues keep recurring

---

## Quick Reference

```bash
# Run audit
SUPABASE_URL=https://wvhnuiajtvoajjhumzxe.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=[KEY] \
npm run audit:data-hygiene

# View report
cat data-hygiene-audit-report.json | jq '.summary'

# Check for critical issues
cat data-hygiene-audit-report.json | jq '.findings[] | select(.severity=="CRITICAL")'

# Count total issues
cat data-hygiene-audit-report.json | jq '.summary.total_issues'
```

---

**Ready to run your first audit?** Get your service role key from Supabase and run the command above!
