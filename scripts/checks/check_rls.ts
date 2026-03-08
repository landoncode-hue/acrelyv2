
import dotenv from 'dotenv';
import path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!dbPassword || !supabaseUrl) {
    console.error('Missing env vars');
    process.exit(1);
}

const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];
if (!projectRef) {
    console.error('Could not extract project ref');
    process.exit(1);
}

const dbUrl = `postgres://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

// Prevent hanging
const sql = postgres(dbUrl, { max: 1, idle_timeout: 5, connect_timeout: 10 });

async function main() {
    try {
        console.log('Checking RLS for table "plots"...');
        const policies = await sql`
            SELECT * FROM pg_policies WHERE tablename = 'plots';
        `;

        if (policies.length === 0) {
            console.log('No policies found for "plots". Default denial?');
            // Check if RLS is enabled
            const tables = await sql`
                SELECT relname, relrowsecurity 
                FROM pg_class 
                WHERE relname = 'plots';
            `;
            console.log('RLS Enabled:', tables[0]?.relrowsecurity);
        } else {
            console.log('Policies found:');
            policies.forEach(p => {
                console.log(`- ${p.policyname} (${p.cmd}): ${p.qual} (Roles: ${p.roles})`);
            });
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await sql.end();
    }
}

main();
