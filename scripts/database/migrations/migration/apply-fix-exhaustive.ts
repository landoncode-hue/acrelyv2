
import { Client } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config(); // Loads .env by default
dotenv.config({ path: ".env.local" }); // Overrides with .env.local if present

const ref = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "").replace(".supabase.co", "");
const password = process.env.SUPABASE_DB_PASSWORD;

async function tryClient(config: any) {
    const client = new Client(config);
    try {
        await client.connect();
        return client;
    } catch (e: any) {
        await client.end().catch(() => { });
        return null;
    }
}

async function run() {
    if (!ref || !password) {
        console.error("Missing SUPABASE info");
        process.exit(1);
    }

    const configs = [
        // Direct
        { host: `db.${ref}.supabase.co`, port: 5432, user: "postgres", password, database: "postgres" },
        // Pooler Transaction
        { host: `aws-0-eu-west-2.pooler.supabase.com`, port: 6543, user: `postgres.${ref}`, password, database: "postgres", ssl: { rejectUnauthorized: false } },
        // Pooler Session
        { host: `aws-0-eu-west-2.pooler.supabase.com`, port: 5432, user: `postgres.${ref}`, password, database: "postgres", ssl: { rejectUnauthorized: false } },
        // Common Regional Poolers
        { host: `aws-0-us-east-1.pooler.supabase.com`, port: 6543, user: `postgres.${ref}`, password, database: "postgres", ssl: { rejectUnauthorized: false } },
        { host: `db.${ref}.supabase.net`, port: 5432, user: "postgres", password, database: "postgres" },
    ];

    let client: Client | null = null;
    for (const config of configs) {
        console.log(`Trying ${config.host}:${config.port}...`);
        client = await tryClient(config);
        if (client) {
            console.log("✅ Connected!");
            break;
        }
    }

    if (!client) {
        console.error("❌ All connection attempts failed.");
        process.exit(1);
    }

    try {
        const sql = `
        -- Update the inventory trigger to respect legacy import mode
        CREATE OR REPLACE FUNCTION public.update_estate_inventory_counts()
        RETURNS TRIGGER AS $$
        DECLARE
          v_estate_id UUID;
          v_total INTEGER;
          v_occupied INTEGER;
          v_available INTEGER;
        BEGIN
          -- [NEW] Bypass if legacy import mode is active
          IF current_setting('app.legacy_import_mode', true) = 'true' THEN
            RETURN NULL;
          END IF;

          -- Determine estate_id
          IF (TG_OP = 'DELETE') THEN
            v_estate_id := OLD.estate_id;
          ELSE
            v_estate_id := NEW.estate_id;
          END IF;

          SELECT COUNT(*) INTO v_total FROM public.plots WHERE estate_id = v_estate_id;
          SELECT COUNT(*) INTO v_occupied FROM public.plots WHERE estate_id = v_estate_id AND status != 'available';
          v_available := v_total - v_occupied;

          PERFORM set_config('app.allow_inventory_update', 'true', true);
          UPDATE public.estates SET total_plots = v_total, occupied_plots = v_occupied, available_plots = v_available, updated_at = NOW() WHERE id = v_estate_id;
          PERFORM set_config('app.allow_inventory_update', NULL, true);

          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        `;

        await client.query(sql);
        console.log("✅ Trigger fix applied!");
    } catch (e: any) {
        console.error("❌ SQL Error:", e.message);
    } finally {
        await client.end();
    }
}

run();
