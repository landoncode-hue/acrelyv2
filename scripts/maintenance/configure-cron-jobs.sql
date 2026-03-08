-- Cron Job Configuration for Data Cleanup and Job Monitoring
-- Run this in Supabase SQL Editor after replacing [YOUR-SERVICE-ROLE-KEY]

-- Step 1: Configure service role key
-- Replace [YOUR-SERVICE-ROLE-KEY] with your actual service role key from Supabase Dashboard
ALTER DATABASE postgres SET app.settings.service_role_key TO '[YOUR-SERVICE-ROLE-KEY]';

-- Step 2: Schedule daily data cleanup at 3 AM UTC
SELECT cron.schedule(
  'daily-data-cleanup',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wvhnuiajtvoajjhumzxe.supabase.co/functions/v1/data-cleanup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);

-- Step 3: Schedule job health monitoring every 6 hours
SELECT cron.schedule(
  'job-health-monitoring',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wvhnuiajtvoajjhumzxe.supabase.co/functions/v1/job-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);

-- Verify cron jobs were scheduled
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname IN ('daily-data-cleanup', 'job-health-monitoring');
