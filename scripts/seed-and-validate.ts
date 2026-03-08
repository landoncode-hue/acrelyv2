
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

console.log('🚀 Starting Master Seed & Validate Pipeline...');

// Helper to run steps
const run = (cmd: string, desc: string) => {
    console.log(`\n▶️  [${desc}]`);
    try {
        execSync(cmd, { stdio: 'inherit' });
        console.log(`✅  [${desc}] Complete`);
    } catch (e) {
        console.error(`❌  [${desc}] Failed!`);
        process.exit(1);
    }
};

async function main() {
    // 1. Nuke
    run('tsx tests/setup/clean-db.ts', 'Nuke Database');

    // 2. Seed Estates (Clean Slate)
    // reset-estates.ts deletes estates too, but clean-db is more thorough.
    // reset-estates creates new estates with PLOT-XXX format now.
    run('tsx scripts/database/reset-estates.ts', 'Seed Estates & Plots');

    // 3. Import Legacy Data (Using the Playwright script logic adapted to direct DB would be faster/safer than UI)
    // BUT user asked to use "what we spoke about". 
    // The Playwright script failed initially but we built fixers.
    // Actually, `process-failed-legacy.ts` was the retry script. What was the PRIMARY import script?
    // It was `tests/e2e/legacy-import-all.spec.ts`.
    // Running E2E is slow. 
    // Let's create `scripts/import/master-legacy-import.ts` which combines logic or runs the E2E.
    // For "tiptop shape", we want the data IN.
    // Let's run the E2E script headless as the import mechanism? Or assume the previous E2E test run did it?
    // The previous E2E list included `legacy-import-all.spec.ts` but it's huge.
    // Let's try running `process-failed-legacy.ts` logic adapted for ALL records?
    // No, let's stick to the tools we built.

    // NOTE: Since we just nuked, we need to import EVERYTHING.
    // `process-failed-legacy.ts` only processes `failed_legacy_imports.json`.
    // I should create a `scripts/import/import-all-legacy-direct.ts` based on `process-failed-legacy.ts` logic but for the FULL CSV.
    // This is safer and faster than Playwright for seeding.

    run('tsx scripts/import/import-all-legacy-direct.ts', 'Import All Legacy Data');

    // 4. Run Fixes (Just in case, though direct import might handle some)
    run('tsx scripts/audit/fix-legacy-dates.ts', 'Fix Dates'); // Still useful for normalization

    // Standardize Plots (Should be redundant if seed/import are correct, but good safety)
    run('tsx scripts/database/standardize-plots.ts', 'Standardize Plots');

    // Refactor Complexes (Split super plots)
    run('tsx scripts/database/refactor-complex-plots.ts', 'Refactor Complexes');

    // Cleanup
    run('tsx scripts/database/cleanup-unassigned.ts', 'Cleanup Unassigned');

    console.log('\n✨ System is in TIPTOP shape! Ready to merge.');
}

// We need to create `scripts/import/import-all-legacy-direct.ts` first!
// So let's write that file next.
main();
