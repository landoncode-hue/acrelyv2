# Vercel Free Tier Cron Limitations

## Issue
Vercel Hobby (free) plan only allows **daily** cron jobs. Jobs that run more frequently (hourly, every 6 hours, etc.) require the Pro plan ($20/month).

---

## Solution: Daily Cleanup Only

We've configured **only the daily cleanup job** to run via Vercel Cron:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

**What runs automatically:**
- ✅ Data cleanup (daily at 3 AM UTC)

**What doesn't run automatically:**
- ❌ Job monitoring (every 6 hours) - requires Pro plan

---

## Alternative for Job Monitoring

Since job monitoring can't run on free tier, here are alternatives:

### Option 1: Manual Monitoring (Recommended for Free Tier)

Run job monitoring manually when needed:

```bash
curl -X GET https://your-app.vercel.app/api/cron/job-monitor \
  -H "Authorization: Bearer sO0cAT2lNktRNN35sgC2kSgBaQKmkhV2GXB5ty3qDYY="
```

Or create a simple npm script in `package.json`:
```json
{
  "scripts": {
    "monitor:jobs": "curl -X GET https://your-app.vercel.app/api/cron/job-monitor -H 'Authorization: Bearer $CRON_SECRET'"
  }
}
```

### Option 2: Daily Job Monitoring

Change job-monitor to run daily instead of every 6 hours:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/cron/job-monitor",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs job monitoring daily at 9 AM UTC (6 hours after cleanup).

### Option 3: Combine Both Jobs

Modify the cleanup endpoint to also run job monitoring:

```typescript
// In /api/cron/cleanup/route.ts
// After cleanup completes, also run job monitoring
const monitorResponse = await fetch(
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/cron/job-monitor`,
  {
    headers: {
      'Authorization': request.headers.get('authorization')!
    }
  }
);
```

### Option 4: Upgrade to Pro ($20/month)

If you need frequent job monitoring:
- Vercel Pro: $20/month
- Unlimited cron jobs
- Custom schedules (hourly, every 6 hours, etc.)

---

## Current Setup

**Automatic (Free):**
- Daily cleanup at 3 AM UTC ✅

**Manual (When Needed):**
- Job monitoring via API call
- Data hygiene audit via npm script

---

## Deployment

Now that we've removed the 6-hourly cron, you can deploy:

```bash
vercel --prod
```

This will work on the free tier!

---

## Monitoring Cleanup Jobs

Check if cleanup is running:

```sql
-- In Supabase SQL Editor
SELECT * FROM backup_logs 
WHERE operation = 'data_cleanup'
ORDER BY created_at DESC 
LIMIT 10;
```

Check admin notifications:
```sql
SELECT * FROM notifications 
WHERE title LIKE '%Cleanup%'
ORDER BY created_at DESC;
```

---

## Summary

✅ **What's Automated (Free):**
- Daily data cleanup at 3 AM UTC

⏸️ **What's Manual (Free):**
- Job health monitoring (run via API when needed)
- Data hygiene audits (run via npm script)

💰 **What Requires Pro:**
- Hourly/6-hourly job monitoring
- More frequent cleanup schedules
