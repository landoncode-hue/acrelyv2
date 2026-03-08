
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

async function resetDatabase() {
    console.log('🚧 Starting Database Cleanup...');
    console.log('Target: ', supabaseUrl);

    try {
        // 1. Transactions & Finance (Reverse Order of Dependency)
        console.log('Deleting Receipts...');
        await supabase.from('receipts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Installments...');
        await supabase.from('payment_plan_installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Payments...');
        await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Payment Plans...');
        await supabase.from('payment_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 2. Allocations & Plots
        console.log('Deleting Allocations...');
        await supabase.from('allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Resetting Plots to Available...');
        // Updates all plots that are not already available
        // Removed allocation_id as it does not exist
        const { error: plotError } = await supabase.from('plots').update({
            status: 'available',
            customer_id: null
        }).neq('status', 'available');

        if (plotError) console.error("Plot Reset Error:", plotError.message);


        // 3. CRM Data
        console.log('Deleting Documents...');
        await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Communications...');
        await supabase.from('communications').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Customer Notes...');
        await supabase.from('customer_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Portal Sessions...');
        await supabase.from('customer_portal_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Notifications...');
        await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 4. Core Entities
        // Remove customers and leads
        console.log('Deleting Customers...');
        await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('Deleting Leads...');
        await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 5. Cleanup Profiles (Auth Users)
        console.log('Deleting Customer Activity Logs & Profiles...');

        // Find customers 
        const { data: customerProfiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'customer');

        if (customerProfiles && customerProfiles.length > 0) {
            const customerIds = customerProfiles.map(p => p.id);

            // Delete audit logs for these users first to handle FK constraint
            console.log(`Clearing audit logs for ${customerIds.length} customers...`);
            const { error: auditError } = await supabase.from('audit_logs').delete().in('actor_user_id', customerIds);
            if (auditError) console.error("Audit Log Cleanup Error:", auditError.message);

            // Now delete profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .in('id', customerIds);

            if (profileError) {
                console.error('Error deleting profiles:', profileError);
            } else {
                console.log(`Deleted ${customerIds.length} customer profiles.`);
            }
        } else {
            console.log("No customer profiles found.");
        }

        console.log('✅ Database Cleanup Complete!');

    } catch (error) {
        console.error('❌ Cleanup Failed:', error);
    }
}

resetDatabase();
