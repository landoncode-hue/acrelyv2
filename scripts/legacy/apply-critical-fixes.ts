#!/usr/bin/env tsx

/**
 * Script to apply critical fix migrations
 * Run this after reviewing the migration files
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const migrations = [
    '20260117200000_cleanup_test_data.sql',
    '20260117200100_standardize_allocation_status.sql',
    '20260117200200_orphaned_records_detection.sql',
    '20260117200300_restore_receipt_immutability.sql',
];

async function applyMigration(filename: string) {
    console.log(`\n📄 Applying migration: ${filename}`);

    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', filename);

    if (!fs.existsSync(migrationPath)) {
        console.error(`❌ Migration file not found: ${migrationPath}`);
        return false;
    }

    const sql = fs.readFileSync(migrationPath, 'utf-8');

    try {
        // Note: Supabase client doesn't support raw SQL execution directly
        // You'll need to use the Supabase CLI or psql to apply these
        console.log(`⚠️  Please apply this migration using:`);
        console.log(`   supabase db push --db-url "${SUPABASE_URL}"`);
        console.log(`   OR`);
        console.log(`   psql "$DATABASE_URL" -f ${migrationPath}`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed to apply migration: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🔧 Critical Fix Migrations\n');
    console.log('='.repeat(60));
    console.log('\n⚠️  IMPORTANT: Review each migration before applying!\n');

    console.log('Migrations to apply:');
    migrations.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n📋 Migration Summary:\n');
    console.log('1. cleanup_test_data.sql');
    console.log('   - Removes test customers, estates, and leads from production');
    console.log('   - ⚠️  This will DELETE data permanently\n');

    console.log('2. standardize_allocation_status.sql');
    console.log('   - Migrates "completed" → "approved" status');
    console.log('   - Adds status transition validation');
    console.log('   - Prevents invalid status changes\n');

    console.log('3. orphaned_records_detection.sql');
    console.log('   - Creates functions to find orphaned records');
    console.log('   - Provides cleanup utilities');
    console.log('   - Safe to apply (read-only functions)\n');

    console.log('4. restore_receipt_immutability.sql');
    console.log('   - Restores receipt immutability');
    console.log('   - Implements soft delete for compliance');
    console.log('   - Prevents hard deletes\n');

    console.log('='.repeat(60));
    console.log('\n📝 To apply these migrations:\n');
    console.log('Option 1: Using Supabase CLI');
    console.log('  supabase db push\n');

    console.log('Option 2: Using psql');
    console.log('  export DATABASE_URL="your-connection-string"');
    migrations.forEach(m => {
        console.log(`  psql "$DATABASE_URL" -f supabase/migrations/${m}`);
    });

    console.log('\n⚠️  Recommended order:');
    console.log('  1. Review each migration file');
    console.log('  2. Backup database');
    console.log('  3. Apply migrations in order');
    console.log('  4. Verify results');
    console.log('  5. Monitor for issues\n');
}

main();
