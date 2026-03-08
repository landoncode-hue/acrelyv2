
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Script to scan migrations for RLS compliance
const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase/migrations');

function analyzeMigrations() {
    console.log('🔍 Scanning migrations for RLS usage...');

    // glob.sync returns string[] in v8+, but checking just in case
    const files = glob.sync(`${MIGRATIONS_DIR}/*.sql`);

    if (files.length === 0) {
        console.log("No migrations found in: " + MIGRATIONS_DIR);
        return;
    }

    const tables = new Set<string>();
    const rlsEnabled = new Set<string>();

    // 1. Identify Tables and RLS enablement
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();

        // Find "create table public.xyz" or "create table xyz"
        // Avoid "create table if not exists" complexity with generous regex
        const createMatches = content.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-z0-9_]+)/g);
        for (const match of createMatches) {
            const tableName = match[1];
            if (tableName) tables.add(tableName);
        }

        // Find "enable row level security"
        const rlsMatches = content.matchAll(/alter\s+table\s+(?:only\s+)?(?:public\.)?([a-z0-9_]+)\s+enable\s+row\s+level\s+security/g);
        for (const match of rlsMatches) {
            const tableName = match[1];
            if (tableName) rlsEnabled.add(tableName);
        }
    });

    console.log(`Found ${tables.size} tables defined in migrations.`);
    console.log(`Found ${rlsEnabled.size} tables with explicitly enabled RLS.`);

    // 2. Diff
    const unrestricted: string[] = [];
    tables.forEach(t => {
        if (!rlsEnabled.has(t)) {
            unrestricted.push(t);
        }
    });

    if (unrestricted.length > 0) {
        console.log('\n⚠️  Potentially Unrestricted Tables (No "ENABLE ROW LEVEL SECURITY" found):');
        console.log(unrestricted.sort());
    } else {
        console.log('\n✅ All detected tables appear to have RLS enabled.');
    }

    console.log('\n(Note: This is a static analysis. Tables might have RLS enabled in other ways or be false positives like junction tables if handled inline).');
}

analyzeMigrations();
