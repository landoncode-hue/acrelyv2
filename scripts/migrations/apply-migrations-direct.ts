import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const ref = "wvhnuiajtvoajjhumzxe";
const password = process.env.SUPABASE_DB_PASSWORD || "Arelius";

const REGIONS = [
    "aws-0-us-east-1",
    "aws-0-eu-west-1",
    "aws-0-eu-central-1",
    "aws-0-eu-west-2",
    "aws-0-eu-west-3",
    "aws-0-us-west-1",
    "aws-0-sa-east-1",
    "aws-0-ap-southeast-1"
];

const PORTS = [6543, 5432];

async function tryConnect() {
    for (const region of REGIONS) {
        for (const port of PORTS) {
            const host = `${region}.pooler.supabase.com`;
            const user = `postgres.${ref}`;
            console.log(`Trying ${host}:${port}...`);

            const sql = postgres({
                host,
                port,
                user,
                password,
                database: "postgres",
                ssl: { rejectUnauthorized: false },
                connect_timeout: 5
            });

            try {
                await sql`SELECT 1`;
                console.log(`✅ Connected via ${host}:${port}`);
                return sql;
            } catch (e) {
                // console.log(`❌ Failed ${host}:${port}`);
                await sql.end().catch(() => { });
            }
        }
    }
    return null;
}

async function applyMigrations() {
    const sql = await tryConnect();
    if (!sql) {
        console.error("❌ Could not connect to any Supabase pooler.");
        process.exit(1);
    }

    const migrations = [
        '20260117200000_cleanup_test_data.sql',
        '20260117200100_standardize_allocation_status.sql',
        '20260117200200_orphaned_records_detection.sql',
        '20260117200300_restore_receipt_immutability.sql',
    ];

    for (const m of migrations) {
        console.log(`Applying ${m}...`);
        const filePath = path.join(process.cwd(), 'supabase', 'migrations', m);
        const content = fs.readFileSync(filePath, 'utf8');

        try {
            await sql.unsafe(content);
            console.log(`✅ Applied ${m}`);
        } catch (e) {
            console.error(`❌ Failed to apply ${m}:`, e);
            // We don't exit if it already exists or something similar? 
            // Better to exit on error for migrations to ensure order.
            process.exit(1);
        }
    }

    await sql.end();
}

applyMigrations().then(() => {
    console.log('All migrations applied successfully!');
    process.exit(0);
}).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
