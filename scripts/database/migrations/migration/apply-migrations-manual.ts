
import postgres from "postgres"; // Using 'postgres' package from package.json
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!supabaseUrl || !dbPassword) {
    console.error("Missing credentials in .env.local");
    process.exit(1);
}

// Extract project ID
// https://[project-ref].supabase.co
const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
const dbUrl = `postgres://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

console.log("Connecting to DB:", `postgres://postgres:****@db.${projectRef}.supabase.co:5432/postgres`);

const sql = postgres(dbUrl, {
    ssl: { rejectUnauthorized: false },
    prepare: false, // Required for some statements like ALTER TYPE in some drivers, safe to disable for scripts
});

async function runMigrations() {
    try {
        console.log("Adding 'partially_allocated' to plot_status...");
        // ALTER TYPE cannot run inside a transaction block usually
        await sql.unsafe(`ALTER TYPE plot_status ADD VALUE IF NOT EXISTS 'partially_allocated'`);
        console.log("Success: Added 'partially_allocated'");
    } catch (e: any) {
        console.error("Error adding enum:", e.message);
    }

    try {
        console.log("Applying Customer Cascade Delete constraints...");
        await sql.unsafe(`
            -- Allocations
            ALTER TABLE allocations DROP CONSTRAINT IF EXISTS allocations_customer_id_fkey;
            ALTER TABLE allocations ADD CONSTRAINT allocations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

            -- Payments
            ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_customer_id_fkey;
            ALTER TABLE payments ADD CONSTRAINT payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

            -- Plots
            ALTER TABLE plots DROP CONSTRAINT IF EXISTS plots_customer_id_fkey;
            ALTER TABLE plots ADD CONSTRAINT plots_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
        `);
        console.log("Success: Applied Cascade Deletes");
    } catch (e: any) {
        console.error("Error applying cascade deletes:", e.message);
    }

    await sql.end();
}

runMigrations();
