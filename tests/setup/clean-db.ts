/**
 * clean-db.ts
 *
 * A standalone script to manually trigger database cleanup.
 * Used by npm run test:clean.
 */

import globalTeardown from '../global-teardown.js';

async function run() {
  console.log('🧹 Manually cleaning database...\n');
  await globalTeardown();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
