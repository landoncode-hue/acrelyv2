
import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Parse connection string or use params
// Supabase local default: postgresql://postgres:postgres@127.0.0.1:54322/postgres
const DB_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function main() {
    console.log("🛠️  Applying Hotfix Migrations manually...");

    const client = new Client({
        connectionString: DB_URL,
    });

    try {
        await client.connect();
        console.log("✅ Connected to Database.");

        const files = [
            'supabase/migrations/20251210000000_allow_null_plot_id.sql',
            'supabase/migrations/20251210000002_fix_payment_trigger_name.sql'
        ];

        for (const file of files) {
            console.log(`Applying ${file}...`);
            const sql = fs.readFileSync(file, 'utf8');
            await client.query(sql);
            console.log(`✅ Applied ${file}`);
        }

        console.log("🎉 All hotfix migrations applied.");

    } catch (err: any) {
        console.error("❌ Migration Failed:", err);
        // If connection refused, maybe port is different?
        if (err.code === 'ECONNREFUSED') {
            console.error("\nCheck if Supabase is running (npx supabase start) and port is 54322.");
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
