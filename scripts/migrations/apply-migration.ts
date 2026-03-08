import postgres from 'postgres';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const dbUrl = `postgresql://postgres:${dbPassword}@db.wvhnuiajtvoajjhumzxe.supabase.co:5432/postgres`;

const sql = postgres(dbUrl);

async function applyMigration() {
    const migrationPath = '/Users/lordkay/Development/acrely/supabase/migrations/20260105103000_fix_kpi_nested_aggregates.sql';
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration...');
    try {
        await sql.unsafe(migrationSql);
        console.log('Migration applied successfully!');
    } catch (error) {
        console.error('Error applying migration:', error);
    } finally {
        await sql.end();
    }
}

applyMigration();
