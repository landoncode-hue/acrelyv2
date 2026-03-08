# Quick Vercel Cron Deployment Guide

## Your Generated CRON_SECRET
```
sO0cAT2lNktRNN35sgC2kSgBaQKmkhV2GXB5ty3qDYY=
```

**⚠️ IMPORTANT**: Save this secret - you'll need it for the next steps!

---

## Deployment Steps

### Option 1: Using Vercel CLI (Recommended)

```bash
# 1. Set the CRON_SECRET environment variable
vercel env add CRON_SECRET

# When prompted:
# - Enter the value: sO0cAT2lNktRNN35sgC2kSgBaQKmkhV2GXB5ty3qDYY=
# - Select environments: Production, Preview, Development (select all)

# 2. Deploy to production
vercel --prod

# 3. Verify cron jobs are set up
vercel crons ls
```

### Option 2: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name**: `CRON_SECRET`
   - **Value**: `sO0cAT2lNktRNN35sgC2kSgBaQKmkhV2GXB5ty3qDYY=`
   - **Environments**: Check all (Production, Preview, Development)
6. Click **Save**
7. Go to **Deployments** tab
8. Click **Redeploy** on the latest deployment

---

## Verify Setup

### Check Cron Jobs

```bash
# List all cron jobs
vercel crons ls

# Expected output:
# cleanup       /api/cron/cleanup       0 3 * * *       enabled
# job-monitor   /api/cron/job-monitor   0 */6 * * *     enabled
```

### Test Endpoints Locally

```bash
# Test cleanup endpoint
curl -X GET http://localhost:3000/api/cron/cleanup \
  -H "Authorization: Bearer sO0cAT2lNktRNN35sgC2kSgBaQKmkhV2GXB5ty3qDYY="

# Test job monitor endpoint
curl -X GET http://localhost:3000/api/cron/job-monitor \
  -H "Authorization: Bearer sO0cAT2lNktRNN35sgC2kSgBaQKmkhV2GXB5ty3qDYY="
```

### Test Production Endpoints

After deployment:
```bash
# Replace YOUR-APP with your Vercel app URL
curl -X GET https://YOUR-APP.vercel.app/api/cron/cleanup \
  -H "Authorization: Bearer sO0cAT2lNktRNN35sgC2kSgBaQKmkhV2GXB5ty3qDYY="
```

---

## Troubleshooting

### "vercel: command not found"

Install Vercel CLI:
```bash
npm i -g vercel
```

### Cron jobs not showing

Make sure `vercel.json` has the crons configuration (already done ✅)

### 401 Unauthorized

- Verify `CRON_SECRET` is set in Vercel environment variables
- Check the authorization header matches exactly

---

## What Happens Next

Once deployed:
1. **Daily at 3 AM UTC**: Data cleanup runs automatically
2. **Every 6 hours**: Job health monitoring runs
3. **Admin notifications**: You'll get in-app notifications for any issues
4. **Logs**: Check `backup_logs` table in Supabase

---

## Quick Commands Reference

```bash
# Add environment variable
vercel env add CRON_SECRET

# Deploy to production
vercel --prod

# List cron jobs
vercel crons ls

# View deployment logs
vercel logs

# Check project info
vercel inspect
```

---

Ready to deploy? Run:
```bash
vercel env add CRON_SECRET
vercel --prod
```
