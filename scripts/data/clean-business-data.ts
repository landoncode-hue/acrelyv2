import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function cleanBusinessData() {
    console.log('🗑️  Starting Business Data Cleanup...');
    console.log('⚠️  This will delete all customer data, estates, plots, and leads.');
    console.log('ℹ️  System admin accounts and configurations will be PRESERVED.\n');

    try {
        // 0. Break circular dependency: Clear plot allocation references
        console.log('0. Clearing plot allocation references...');
        const { error: plotRefError } = await supabase
            .from('plots')
            .update({ half_a_allocation_id: null, half_b_allocation_id: null })
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (plotRefError) console.error('   ❌ Error clearing plot refs:', plotRefError.message);
        else console.log('   ✅ Cleared plot allocation references');

        // 1. Delete payment plan installments
        console.log('1. Deleting payment plan installments...');
        await deleteFromTable('payment_plan_installments');

        // 2. Delete payment plans
        console.log('2. Deleting payment plans...');
        await deleteFromTable('payment_plans');

        // 3. Delete receipts
        console.log('3. Deleting receipts...');
        await deleteFromTable('receipts');

        // 4. Delete payments
        console.log('4. Deleting payments...');
        await deleteFromTable('payments');

        // 5. Delete allocation reassignments
        console.log('5. Deleting allocation reassignments...');
        await deleteFromTable('allocation_reassignments');

        // 6. Delete allocation plots (junction table)
        console.log('6. Deleting allocation plots...');
        await deleteFromTable('allocation_plots');

        // 7. Delete allocations
        console.log('7. Deleting allocations...');
        await deleteFromTable('allocations');

        // 8. Delete commission history
        console.log('8. Deleting commission history...');
        await deleteFromTable('commission_history');

        // 9. Delete customer documents
        console.log('9. Deleting customer documents...');
        const { error: docsError } = await supabase
            .from('documents')
            .delete()
            .not('customer_id', 'is', null);
        if (docsError) console.error('   ❌ Error:', docsError.message);
        else console.log('   ✅ Deleted customer documents');

        // 10. Delete customer notes
        console.log('10. Deleting customer notes...');
        await deleteFromTable('customer_notes');

        // 11. Delete interaction logs
        console.log('11. Deleting interaction logs...');
        await deleteFromTable('interaction_logs');

        // 12. Delete leads
        console.log('12. Deleting leads...');
        await deleteFromTable('leads');

        // 13. Delete customer phone numbers
        console.log('13. Deleting customer phone numbers...');
        await deleteFromTable('customer_phone_numbers');

        // 14. Delete customers
        console.log('14. Deleting customers...');
        await deleteFromTable('customers');

        // 15. Delete plots
        console.log('15. Deleting all plots...');
        await deleteFromTable('plots');

        // 16. Delete estates
        console.log('16. Deleting all estates...');
        await deleteFromTable('estates');

        // 17. Delete customer profiles from 'profiles' table and auth.users
        console.log('17. Deleting customer profiles and auth users...');
        await deleteCustomerProfilesAndAuth();

        console.log('\n✅ Business data cleanup finished!');
        console.log('✅ All customers, estates, and related data have been removed.');
        console.log('✅ Admin accounts should be intact.');

    } catch (error) {
        console.error('\n❌ Error during cleanup:', error);
        process.exit(1);
    }
}

async function deleteFromTable(table: string) {
    const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack for "delete all"

    if (error) {
        console.error(`   ❌ Error cleaning ${table}:`, error.message);
    } else {
        console.log(`   ✅ Cleaned ${table}`);
    }
}

async function deleteCustomerProfilesAndAuth() {
    // 1. Get all profiles that are NOT staff (i.e. customers)
    // Adjust logic if 'role' column is the source of truth
    const { data: customerProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'customer');

    if (fetchError) {
        console.error('   ❌ Error fetching customer profiles:', fetchError.message);
        return;
    }

    if (!customerProfiles || customerProfiles.length === 0) {
        console.log('   ℹ️  No customer profiles found to delete.');
        return;
    }

    console.log(`   found ${customerProfiles.length} customer profiles to delete.`);

    // 2. Delete from audit_logs (to satisfy FK)
    const ids = customerProfiles.map(p => p.id);
    console.log('   Deleting related audit_logs...');
    const { error: deleteAuditError } = await supabase
        .from('audit_logs')
        .delete()
        .in('actor_user_id', ids);

    if (deleteAuditError) {
        console.error('   ❌ Error deleting audit_logs:', deleteAuditError.message);
    } else {
        console.log('   ✅ Deleted customer audit_logs');
    }

    // 3. Delete from profiles table
    const { error: deleteProfilesError } = await supabase
        .from('profiles')
        .delete()
        .in('id', ids);

    if (deleteProfilesError) {
        console.error('   ❌ Error deleting profiles:', deleteProfilesError.message);
        return;
    }
    console.log('   ✅ Deleted from profiles table');

    // 3. Delete from auth.users using admin API
    let deletedCount = 0;
    for (const profile of customerProfiles) {
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(profile.id);
        if (deleteAuthError) {
            console.error(`   ⚠️ Failed to delete auth user ${profile.email}: ${deleteAuthError.message}`);
        } else {
            deletedCount++;
        }
    }
    console.log(`   ✅ Deleted ${deletedCount} users from auth system`);
}

cleanBusinessData();
