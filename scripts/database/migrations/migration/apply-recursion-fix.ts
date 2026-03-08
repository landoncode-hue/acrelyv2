
import { Client } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const DB_CONFIG = {
    user: process.env.POSTGRES_USER || "postgres",
    host: process.env.POSTGRES_HOST || "127.0.0.1",
    database: process.env.POSTGRES_DB || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    port: parseInt(process.env.POSTGRES_PORT || "54322"),
};

let connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const ref = url.replace("https://", "").replace(".supabase.co", "");
    const password = process.env.SUPABASE_DB_PASSWORD;
    connectionString = `postgresql://postgres:${password}@db.${ref}.supabase.co:5432/postgres`;
}

const REGIONS = [
    "aws-0-eu-west-2",
    "aws-0-us-east-1",
    "aws-0-eu-west-1",
    "aws-0-eu-central-1"
];

async function tryPooler(region: string, ref: string, password: string) {
    const host = `${region}.pooler.supabase.com`;
    const user = `postgres.${ref}`;
    const client = new Client({
        host,
        port: 6543,
        user,
        password,
        database: "postgres",
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        return client;
    } catch (e: any) {
        await client.end().catch(() => { });
        return null;
    }
}

async function run() {
    let client: Client | null = null;

    if (connectionString) {
        try {
            const c = new Client({
                connectionString,
                ssl: { rejectUnauthorized: false }
            });
            await c.connect();
            client = c;
            console.log("✅ Used connection string");
        } catch (e: any) {
            console.log("❌ Failed to use connection string:", e.message);
        }
    }

    if (!client && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const ref = url.replace("https://", "").replace(".supabase.co", "");
        const password = process.env.SUPABASE_DB_PASSWORD;
        for (const region of REGIONS) {
            client = await tryPooler(region, ref, password);
            if (client) break;
        }
    }

    if (!client) {
        for (const port of [54322, 54329, 5432]) {
            try {
                const c = new Client({ ...DB_CONFIG, port });
                await c.connect();
                client = c;
                console.log(`✅ Connected to port ${port}`);
                break;
            } catch (e) { }
        }
    }

    if (!client) {
        console.error("❌ Could not connect to database");
        process.exit(1);
    }

    try {
        const sqlPath = path.join(process.cwd(), "supabase/migrations/20260118184000_fix_import_recursion.sql");
        console.log(`Applying fix from: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, "utf8");
        await client.query(sql);
        console.log("✅ Recursion Fix Applied Successfully");
    } catch (err) {
        console.error("❌ Failed to apply fix:", err);
    } finally {
        await client.end();
    }
}

run();
