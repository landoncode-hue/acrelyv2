# Alternative Cleanup Solutions (Without Supabase Cron)

Since Supabase cron jobs require a paid plan, here are alternative approaches:

---

## Option 1: Vercel Cron (Recommended)

Vercel provides cron jobs on the free Hobby plan.

### Setup

1. **Create API Route**: `src/app/api/cron/cleanup/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Run all cleanup jobs
    const { data, error } = await supabase.rpc('run_all_cleanup_jobs');

    if (error) throw error;

    // Log results
    await supabase.from('backup_logs').insert({
      operation: 'data_cleanup',
      status: 'completed',
      meta: { jobs: data, timestamp: new Date().toISOString() },
    });

    return NextResponse.json({ success: true, results: data });
  } catch (error: any) {
    await supabase.from('backup_logs').insert({
      operation: 'data_cleanup',
      status: 'failed',
      meta: { error: error.message },
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

2. **Create `vercel.json`** in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/cron/job-monitor",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

3. **Add Environment Variable**:
   - In Vercel Dashboard → Settings → Environment Variables
   - Add `CRON_SECRET` with a random secure value

---

## Option 2: GitHub Actions (Free)

Use GitHub Actions to trigger cleanup via API.

### Setup

Create `.github/workflows/cleanup.yml`:

```yaml
name: Daily Data Cleanup

on:
  schedule:
    - cron: '0 3 * * *'  # 3 AM UTC daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Run Cleanup
        run: |
          curl -X POST https://wvhnuiajtvoajjhumzxe.supabase.co/functions/v1/data-cleanup \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json"
```

Add `SUPABASE_SERVICE_ROLE_KEY` to GitHub Secrets.

---

## Option 3: Client-Side Polling (Simplest)

Similar to the existing overdue lead checker, run cleanup when admins are logged in.

### Create Hook: `src/hooks/use-cleanup-scheduler.ts`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useCleanupScheduler() {
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastRunRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function checkAndRunCleanup() {
      try {
        // Check if cleanup already ran today
        const today = new Date().toISOString().split('T')[0];
        
        if (lastRunRef.current === today) {
          console.log('[Cleanup] Already ran today');
          return;
        }

        // Check last cleanup time from backup_logs
        const { data: lastCleanup } = await supabase
          .from('backup_logs')
          .select('created_at')
          .eq('operation', 'data_cleanup')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const lastRun = lastCleanup?.created_at 
          ? new Date(lastCleanup.created_at)
          : null;

        const now = new Date();
        const hoursSinceLastRun = lastRun 
          ? (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60)
          : 25; // Force run if no previous run

        // Run if more than 24 hours since last cleanup
        if (hoursSinceLastRun > 24) {
          console.log('[Cleanup] Running cleanup jobs...');
          
          const { data, error } = await supabase.rpc('run_all_cleanup_jobs');
          
          if (error) {
            console.error('[Cleanup] Error:', error);
            return;
          }

          console.log('[Cleanup] Complete:', data);
          lastRunRef.current = today;
        }
      } catch (error) {
        console.error('[Cleanup] Failed:', error);
      }
    }

    // Check every hour
    intervalRef.current = setInterval(checkAndRunCleanup, 60 * 60 * 1000);
    
    // Initial check after 30 seconds
    const timeout = setTimeout(checkAndRunCleanup, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(timeout);
    };
  }, []);
}
```

### Use in Dashboard Layout: `src/app/(dashboard)/layout.tsx`

```typescript
import { useCleanupScheduler } from '@/hooks/use-cleanup-scheduler';

export default function DashboardLayout({ children }) {
  useCleanupScheduler(); // Runs when any admin is logged in
  
  return <>{children}</>;
}
```

---

## Comparison

| Solution | Pros | Cons | Cost |
|----------|------|------|------|
| **Vercel Cron** | Reliable, automatic, no user needed | Requires Vercel deployment | Free (Hobby) |
| **GitHub Actions** | Free, reliable, automatic | Requires GitHub repo | Free |
| **Client Polling** | Simple, no external deps | Requires admin to be logged in | Free |

---

## Recommendation

**Use Vercel Cron** - It's the most reliable and requires no user interaction.

### Quick Setup Steps:

1. Create the API routes (provided above)
2. Create `vercel.json` in project root
3. Add `CRON_SECRET` environment variable in Vercel
4. Deploy to Vercel
5. Cron jobs will run automatically

---

## Manual Cleanup (Temporary Solution)

Until you set up automated cleanup, you can run cleanup manually:

```sql
-- Run in Supabase SQL Editor
SELECT * FROM run_all_cleanup_jobs();
```

Or via Edge Function:
```bash
curl -X POST https://wvhnuiajtvoajjhumzxe.supabase.co/functions/v1/data-cleanup \
  -H "Authorization: Bearer [SERVICE-ROLE-KEY]"
```

---

Would you like me to implement the Vercel Cron solution?
