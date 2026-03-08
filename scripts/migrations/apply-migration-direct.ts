
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function main() {
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!dbPassword || !projectUrl) {
        console.error('❌ Missing SUPABASE_DB_PASSWORD or NEXT_PUBLIC_SUPABASE_URL');
        return;
    }

    // Extract project ref from URL (https://ref.supabase.co)
    const projectRef = projectUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
    if (!projectRef) {
        console.error('❌ Could not parse Project Ref from URL');
        return;
    }

    // Try Pooler Connection (EU Central 1)
    const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;
    console.log(`🔌 Connecting to Pooler at aws-0-eu-central-1...`);

    const sql = postgres(connectionString);

    try {
        const migrationFile = path.join(process.cwd(), 'supabase', 'migrations', '20260117030000_fix_plot_recursion.sql');
        const migrationSql = fs.readFileSync(migrationFile, 'utf-8');

        console.log('📜 Applying migration: 20260117030000_fix_plot_recursion.sql');
        await sql.unsafe(migrationSql);
        console.log('✅ Migration successfully applied.');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await sql.end();
    }
}

main();
