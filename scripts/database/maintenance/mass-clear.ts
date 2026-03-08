
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function massClear() {
    console.log('🚧 Starting Mass Cleanup of requested data...');
    console.log('Target: ', supabaseUrl);

    try {
        // 1. Logs (ALL audit logs)
        console.log('Deleting ALL Audit Logs...');
        const { error: logError } = await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (logError) console.error("Audit Log Delete Error:", logError.message);

        // 2. Payments & related
        console.log('Deleting Receipts...');
        await supabase.from('receipts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Payment Plan Installments...');
        await supabase.from('payment_plan_installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Payments...');
        await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Payment Plans...');
        await supabase.from('payment_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 2.5 Commission & Notifications
        console.log('Deleting Commission History...');
        await supabase.from('commission_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Notifications...');
        await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Communications...');
        await supabase.from('communications').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 3. Allocations
        console.log('Deleting Allocations...');
        await supabase.from('allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 4. Leads
        console.log('Deleting Leads...');
        await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 5. Customers
        console.log('Deleting Customers...');
        await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 6. Reset Plots (since allocations are gone)
        console.log('Resetting Plots to available...');
        await supabase.from('plots').update({
            status: 'available',
            customer_id: null
        }).neq('status', 'available');

        // 7. Cleanup Customer Profiles (Auth Users)
        console.log('Cleaning up customer profiles...');
        const { data: customerProfiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'customer');

        if (customerProfiles && customerProfiles.length > 0) {
            const customerIds = customerProfiles.map(p => p.id);
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .in('id', customerIds);

            if (profileError) console.error('Error deleting profiles:', profileError.message);
            else console.log(`Deleted ${customerIds.length} customer profiles.`);
        }

        console.log('✅ Mass Cleanup Complete!');

    } catch (error) {
        console.error('❌ Mass Cleanup Failed:', error);
    }
}

massClear();
