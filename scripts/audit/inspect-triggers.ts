
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const PROJECT_REF = 'wvhnuiajtvoajjhumzxe';

if (!DB_PASSWORD) {
    console.error('SUPABASE_DB_PASSWORD is not set in .env');
    process.exit(1);
}

// Connection options
const connections = [
    {
        name: 'Direct (IPv4)',
        url: `postgres://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`
    },
    {
        name: 'Pooler (US East 1)',
        url: `postgres://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
    },
    {
        name: 'Pooler (EU Central 1) - Just in case',
        url: `postgres://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
    }
];

async function inspectTriggers() {
    for (const conn of connections) {
        console.log(`Trying connection: ${conn.name}...`);
        try {
            const sql = postgres(conn.url, {
                ssl: 'require',
                connect_timeout: 10
            });

            // Query triggers
            const triggers = await sql`
                SELECT 
                    trigger_name,
                    event_manipulation,
                    event_object_table,
                    action_statement,
                    action_orientation,
                    action_timing
                FROM information_schema.triggers
                WHERE event_object_table = 'plots'
            `;

            console.log(`\n--- Triggers on 'plots' table (${conn.name}) ---`);
            console.table(triggers);

            // Also get the function definition for likely culprits
            const specificTriggerName = 'validate_plot_status_transition'; // we know this one
            // Let's get all trigger functions

            console.log('\n--- Trigger Functions ---');
            for (const trigger of triggers) {
                // Trigger action usually looks like "EXECUTE FUNCTION function_name(...)"
                // We want to extract the function name.
                // Actually postgres.js returns columns. action_statement might be "EXECUTE FUNCTION ..."
                console.log(`Trigger: ${trigger.trigger_name}, Action: ${trigger.action_statement}`);
            }

            await sql.end();
            return; // Success
        } catch (error: any) {
            console.error(`Failed to connect with ${conn.name}:`, error.message);
        }
    }
    console.error('All connections failed.');
}

inspectTriggers();
