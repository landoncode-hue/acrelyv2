# Vercel Cron Setup Guide

Since Supabase cron jobs require a paid plan, we're using **Vercel Cron** instead (free on Hobby plan).

---

## ✅ What's Already Done

1. **API Routes Created**:
   - `/api/cron/cleanup` - Daily data cleanup at 3 AM UTC
   - `/api/cron/job-monitor` - Job health monitoring every 6 hours

2. **Vercel Configuration**: `vercel.json` updated with cron schedules

---

## 🔧 Setup Steps

### 1. Add Environment Variable in Vercel

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: Generate a random secure string (e.g., use `openssl rand -base64 32`)
   - **Environments**: Production, Preview, Development

### 2. Verify Existing Environment Variables

Make sure these are already set in Vercel:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

### 3. Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "Add Vercel cron jobs for data cleanup"
git push

# Or deploy directly
vercel --prod
```

### 4. Verify Cron Jobs

After deployment:
1. Go to Vercel Dashboard → Your Project → **Cron Jobs** tab
2. You should see:
   - `cleanup` - Runs daily at 3 AM UTC
   - `job-monitor` - Runs every 6 hours

---

## 🧪 Testing

### Test Cleanup Endpoint

```bash
curl -X GET https://your-app.vercel.app/api/cron/cleanup \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test Job Monitor Endpoint

```bash
curl -X GET https://your-app.vercel.app/api/cron/job-monitor \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "results": [...],
  "total_deleted": 0
}
```

---

## 📊 Monitoring

### Check Cleanup Logs

```sql
-- In Supabase SQL Editor
SELECT * FROM backup_logs 
WHERE operation = 'data_cleanup'
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Job Monitor Logs

```sql
SELECT * FROM backup_logs 
WHERE operation = 'job_monitoring'
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Admin Notifications

```sql
SELECT * FROM notifications 
WHERE title LIKE '%Cleanup%' OR title LIKE '%Job Issues%'
ORDER BY created_at DESC;
```

---

## 🔍 Vercel Cron Logs

View cron execution logs:
1. Vercel Dashboard → Your Project
2. **Deployments** tab
3. Click on a deployment
4. Go to **Functions** tab
5. Find `/api/cron/cleanup` or `/api/cron/job-monitor`
6. View logs

---

## ⚠️ Important Notes

1. **Cron Secret**: Keep `CRON_SECRET` secure - it prevents unauthorized access
2. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code
3. **Free Tier**: Vercel Hobby plan includes cron jobs at no cost
4. **Execution Time**: Cron jobs have a 10-second timeout on Hobby plan

---

## 🆘 Troubleshooting

### Cron Jobs Not Showing in Dashboard

- Ensure `vercel.json` is in project root
- Redeploy: `vercel --prod`
- Check Vercel Dashboard → Cron Jobs tab

### Unauthorized Error

- Verify `CRON_SECRET` is set in Vercel environment variables
- Check authorization header in request

### Jobs Not Running

- Check Vercel Function logs
- Verify cron schedule syntax
- Ensure deployment is successful

### No Records Being Deleted

```sql
-- Check if old records exist
SELECT COUNT(*) FROM customers 
WHERE deleted_at < NOW() - INTERVAL '90 days';

-- Manually test cleanup
SELECT * FROM run_all_cleanup_jobs();
```

---

## 📅 Cron Schedule Reference

- `0 3 * * *` - Daily at 3 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 0 1 * *` - Monthly on the 1st at midnight

---

## ✅ Success Checklist

- [ ] `CRON_SECRET` added to Vercel environment variables
- [ ] Deployed to Vercel
- [ ] Cron jobs visible in Vercel Dashboard
- [ ] Test endpoints return success
- [ ] Cleanup logs appear in `backup_logs` table
- [ ] Admin notifications working

---

**Setup Complete!** Your data cleanup will now run automatically every day at 3 AM UTC.
