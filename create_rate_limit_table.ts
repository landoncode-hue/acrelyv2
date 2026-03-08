import sql from './src/lib/db.ts';

async function main() {
    console.log('Creating auth_rate_limits table...');
    await sql`
        CREATE TABLE IF NOT EXISTS auth_rate_limits (
            id TEXT PRIMARY KEY,
            attempts INTEGER NOT NULL DEFAULT 0,
            locked_until TIMESTAMP WITH TIME ZONE,
            last_attempt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
    `;
    console.log('Table created!');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
