/**
 * Playwright Global Teardown
 *
 * Runs ONCE after all e2e tests complete. Cleans up:
 * - All database records created with the E2E_ prefix
 * - Preserves production / migration data
 *
 * The cleanup is intentionally idempotent — safe to run multiple times.
 */

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default async function globalTeardown() {
  // Only clean if we intentionally seeded
  if (process.env.E2E_SKIP_CLEANUP === 'true') {
    console.log('[global-teardown] Skipping DB cleanup (E2E_SKIP_CLEANUP=true)');
    return;
  }

  console.log('\n[global-teardown] Cleaning up E2E test data...');

  try {
    // Dynamic import to avoid loading db module during test collection
    const { default: sql } = await import('../src/lib/db.js');

    // Delete in dependency order (children before parents)
    await sql`DELETE FROM audit_logs WHERE changes->>'source' = 'e2e'`;
    await sql`DELETE FROM commissions WHERE metadata->>'source' = 'e2e'`;
    
    // Delete allocations for E2E plots first to avoid FK violation
    await sql`DELETE FROM allocations WHERE plot_id IN (SELECT id FROM plots WHERE plot_number LIKE 'E2E_%')`;
    await sql`DELETE FROM allocations WHERE metadata->>'source' = 'e2e'`;
    
    await sql`DELETE FROM plots WHERE plot_number LIKE 'E2E_%'`;
    await sql`DELETE FROM estates WHERE name LIKE 'E2E_%'`;

    // Remove test leads
    await sql`DELETE FROM leads WHERE email LIKE '%@acrely.test' AND full_name LIKE 'E2E_%'`;

    console.log('[global-teardown] ✅ Test data cleaned up.\n');

    // Close the SQL connection pool
    await sql.end();
  } catch (err) {
    // Log but don't fail the run — cleanup is best-effort
    console.warn('[global-teardown] ⚠️  Cleanup encountered an error:', err);
  }
}
