
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function verifyCleanup() {
    console.log('🔍 Verifying Cleanup Results...');

    const tables = [
        'audit_logs',
        'receipts',
        'payment_plan_installments',
        'payments',
        'payment_plans',
        'commission_history',
        'notifications',
        'communications',
        'allocation_plots',
        'allocations',
        'leads',
        'customers'
    ];

    let allClean = true;

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Some tables might have system row? usually not for these.

        if (error) {
            console.error(`❌ Error checking ${table}:`, error.message);
            allClean = false;
        } else {
            if (count === 0) {
                console.log(`✅ ${table}: 0 rows (Clean)`);
            } else {
                console.error(`❌ ${table}: ${count} rows remaining!`);
                allClean = false;
            }
        }
    }

    // Check Plots
    const { count: dirtyPlots, error: plotError } = await supabase
        .from('plots')
        .select('*', { count: 'exact', head: true })
        .or('status.neq.available,customer_id.not.is.null');

    if (plotError) {
        console.error('❌ Error checking plots:', plotError.message);
        allClean = false;
    } else {
        if (dirtyPlots === 0) {
            console.log('✅ Plots: All reset to available (Clean)');
        } else {
            console.error(`❌ Plots: ${dirtyPlots} plots are NOT fully reset!`);
            allClean = false;
        }
    }

    // Check Profiles
    const { count: customerProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

    if (profileError) {
        console.error('❌ Error checking profiles:', profileError.message);
        allClean = false;
    } else {
        if (customerProfiles === 0) {
            console.log('✅ Profiles: 0 customer profiles (Clean)');
        } else {
            console.error(`❌ Profiles: ${customerProfiles} customer profiles remaining!`);
            allClean = false;
        }
    }

    if (allClean) {
        console.log('\n✨ VERIFICATION PASSED: Database is clean.');
    } else {
        console.log('\n⚠️ VERIFICATION FAILED: Some data remains.');
    }
}

verifyCleanup();
