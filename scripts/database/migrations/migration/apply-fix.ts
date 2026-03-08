
import { Client } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

// Default Supabase Local DB settings
// We try to find credentials or use defaults
const DB_CONFIG = {
    user: process.env.POSTGRES_USER || "postgres",
    host: process.env.POSTGRES_HOST || "127.0.0.1",
    database: process.env.POSTGRES_DB || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    port: parseInt(process.env.POSTGRES_PORT || "54322"),
};

let connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD) {
    // Extract ref from URL
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const ref = url.replace("https://", "").replace(".supabase.co", "");
    const password = process.env.SUPABASE_DB_PASSWORD;

    // Construct Direct Connection String
    connectionString = `postgresql://postgres:${password}@db.${ref}.supabase.co:5432/postgres`;
    console.log(`ℹ️ Constructed Connection String for project '${ref}'`);
}


const REGIONS = [
    "aws-0-us-east-1",
    "aws-0-eu-west-1",
    "aws-0-eu-central-1",
    "aws-0-eu-west-2", // London
    "aws-0-eu-west-3", // Paris
    "aws-0-us-west-1",
    "aws-0-sa-east-1",
    "aws-0-ap-southeast-1"
];

async function tryPooler(region: string, ref: string, password: string) {
    const host = `${region}.pooler.supabase.com`;
    const user = `postgres.${ref}`;
    console.log(`Trying pooler: ${host} (User: ${user})`);

    // Pooler requires port 6543 (transaction) or 5432 (session)
    // We use session mode (5432) for migrations if possible, or 6543
    // Supabase poolers usually listen on 6543 and 5432.
    // Let's try 6543 first.

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
        console.log(`✅ Connected to pooler: ${host}`);
        return client;
    } catch (e: any) {
        console.log(`❌ Failed ${host}: ${e.message}`);
        await client.end().catch(() => { });
        return null;
    }
}

const PORTS = [54322, 54329, 5432, 6543];

async function tryConnect(port: number) {
    const config = { ...DB_CONFIG, port };
    console.log(`Trying to connect to port ${port}...`);
    const client = new Client(config);
    try {
        await client.connect();
        console.log(`✅ Connected to port ${port}`);
        return client;
    } catch (e) {
        console.log(`❌ Failed to connect to port ${port}`);
        return null;
    }
}

async function run() {
    let client: Client | null = null;

    // Try provided connection string first
    if (connectionString) {
        try {
            const c = new Client({
                connectionString,
                ssl: { rejectUnauthorized: false } // Required for Supabase
            });
            await c.connect();
            client = c;
            console.log("✅ Used process.env.DATABASE_URL (or constructed)");
        } catch (e: any) {
            console.log("❌ Failed to use DATABASE_URL:", e.message);
        }
    }

    // Try Poolers if no client
    if (!client && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const ref = url.replace("https://", "").replace(".supabase.co", "");
        const password = process.env.SUPABASE_DB_PASSWORD;

        for (const region of REGIONS) {
            client = await tryPooler(region, ref, password);
            if (client) break;
        }
    }

    // Fallback to local ports if still no client
    if (!client) {
        for (const port of PORTS) {
            // Local usually doesn't need SSL, but let's keep it clean
            client = await tryConnect(port);
            if (client) break;
        }
    }

    if (!client) {
        console.error("❌ Could not connect to any database port.");
        process.exit(1);
    }

    try {
        const sqlPath = path.join(process.cwd(), "supabase/migrations/20251207223000_fix_auth_schema.sql");
        console.log(`Reading migration file: ${sqlPath}`);

        if (!fs.existsSync(sqlPath)) {
            throw new Error("Migration file not found!");
        }

        const sql = fs.readFileSync(sqlPath, "utf8");

        console.log("Applying Migration...");
        await client.query(sql);

        console.log("✅ Migration Applied Successfully");
    } catch (err) {
        console.error("❌ Migration Failed:", err);
    } finally {
        await client.end();
    }
}

run();
