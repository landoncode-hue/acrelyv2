
import { Client } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wvhnuiajtvoajjhumzxe.supabase.co";
const ref = url.replace("https://", "").replace(".supabase.co", "");
const password = process.env.SUPABASE_DB_PASSWORD || "Arelius";

const REGIONS = [
    "aws-0-eu-central-1",
    "aws-0-us-east-1",
    "aws-0-eu-west-1",
    "aws-0-eu-west-2",
    "aws-0-eu-west-3",
    "aws-0-us-west-1",
    "aws-0-sa-east-1",
    "aws-0-ap-southeast-1"
];

async function tryConnect(config: any) {
    const client = new Client(config);
    try {
        await client.connect();
        return client;
    } catch (e) {
        await client.end().catch(() => { });
        return null;
    }
}

async function run() {
    let client: Client | null = null;

    // 1. Try Direct
    console.log(`Trying direct: db.${ref}.supabase.co`);
    client = await tryConnect({
        host: `db.${ref}.supabase.co`,
        port: 5432,
        user: "postgres",
        password,
        database: "postgres",
        ssl: { rejectUnauthorized: false }
    });

    // 2. Try Poolers
    if (!client) {
        for (const region of REGIONS) {
            const host = `${region}.pooler.supabase.com`;
            console.log(`Trying pooler: ${host}`);
            client = await tryConnect({
                host,
                port: 6543,
                user: `postgres.${ref}`,
                password,
                database: "postgres",
                ssl: { rejectUnauthorized: false }
            });
            if (client) break;
        }
    }

    if (!client) {
        console.error("❌ Could not connect to any database.");
        process.exit(1);
    }

    try {
        const sqlPath = path.join(process.cwd(), "supabase/migrations/20260106214000_fix_plot_reservation_trigger.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        console.log("Applying Fix Migration...");
        await client.query(sql);
        console.log("✅ Fix Applied Successfully");
    } catch (err) {
        console.error("❌ Fix Failed:", err);
    } finally {
        await client.end();
    }
}

run();
