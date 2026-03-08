import { Client } from 'pg';
import * as fs from 'fs';

const connectionString = 'postgres://postgres.wvhnuiajtvoajjhumzxe:Arelius@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const client = new Client({
    connectionString: connectionString,
});

async function runMigration() {
    try {
        await client.connect();
        const sql = fs.readFileSync('/Users/lordkay/Development/acrely/supabase/migrations/20251212100000_upgrade_communications.sql', 'utf8');
        await client.query(sql);
        console.log('Migration applied successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
