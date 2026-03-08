
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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

async function cleanCustomerData() {
    console.log('🚧 Starting Comprehensive Customer Data Cleanup...');
    console.log('Target:', supabaseUrl);

    try {
        // 1. Audit Logs
        console.log('1. Deleting ALL Audit Logs...');
        const { error: logError } = await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (logError) console.error("   - Audit Log Delete Error:", logError.message);

        // 2. Payments & related
        console.log('2. Deleting Receipts...');
        await supabase.from('receipts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('3. Deleting Payment Plan Installments...');
        await supabase.from('payment_plan_installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('4. Deleting Payments...');
        await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('5. Deleting Payment Plans...');
        await supabase.from('payment_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 3. Commission & Notifications
        console.log('6. Deleting Commission History...');
        await supabase.from('commission_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('7. Deleting Notifications...');
        await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('8. Deleting Communications...');
        await supabase.from('communications').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 4. Neutralize Plot Allocation References (Required for FK)
        console.log('9. Neutralizing Plot Allocation References...');
        const { error: plotNeuturalizeError } = await supabase.from('plots')
            .update({ half_a_allocation_id: null, half_b_allocation_id: null })
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (plotNeuturalizeError) console.error("   - Plot Neutralization Error:", plotNeuturalizeError.message);

        // 4. Allocations & Leads
        // First delete junction table
        console.log('10. Deleting Allocation Plots Junction...');
        await supabase.from('allocation_plots').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('11. Deleting Allocations...');
        await supabase.from('allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('11. Deleting Leads...');
        await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 5. Customers
        console.log('12. Deleting Customers...');
        const { error: custError } = await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (custError) console.error("   - Customer Delete Error:", custError.message);

        // 6. Reset Plots
        console.log('13. Resetting Plots to available...');
        await supabase.from('plots').update({
            status: 'available',
            customer_id: null
        }).neq('status', 'available');

        // 7. Cleanup Customer Profiles (Auth Users)
        console.log('14. Cleaning up customer profiles...');
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

            if (profileError) console.error('   - Error deleting profiles:', profileError.message);
            else console.log(`   - Deleted ${customerIds.length} customer profiles.`);
        } else {
            console.log('   - No customer profiles found to delete.');
        }

        // 8. Final Audit Log Cleanup (to catch logs generated during deletion)
        console.log('15. Final Cleanup of Audit Logs...');
        await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('✅ Comprehensive Customer Data Cleanup Complete!');

    } catch (error) {
        console.error('❌ Cleanup Failed:', error);
    }
}

cleanCustomerData();
