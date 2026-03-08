import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCounts() {
    console.log('📊 Checking Database Counts...\n');

    const tables = [
        'estates', 'plots', 'allocations', 'customers', 'agents',
        'payments', 'commission_history', 'withdrawal_requests',
        'audit_logs', 'notifications', 'profiles'
    ];

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) console.error(`❌ Error checking ${table}:`, error.message);
        else console.log(`${table.padEnd(20)}: ${count}`);
    }

    console.log('\n🔐 Checking Auth Users...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) console.error('❌ Error checking auth users:', error.message);
    else {
        console.log(`auth.users          : ${users.length}`);
        if (users.length > 0) {
            console.log('\n--- Remaining Users ---');
            users.forEach(u => console.log(`- ${u.email} (${u.id})`));
        }
    }
}

checkCounts();
