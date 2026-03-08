
import dotenv from 'dotenv';
import path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = supabaseUrl?.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];
const dbUrl = `postgres://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

const sql = postgres(dbUrl, { max: 1 });

async function main() {
    try {
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'plots';
        `;
        console.log('Columns in plots table:');
        console.table(columns);
    } catch (e) {
        console.error(e);
    } finally {
        await sql.end();
    }
}

main();
