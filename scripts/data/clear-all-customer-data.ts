import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function clearAllCustomerData() {
    console.log('🗑️  Starting COMPLETE Customer Data Cleanup...\n');
    console.log('⚠️  WARNING: This will delete ALL customer-related data!');
    console.log('⚠️  This includes: customers, allocations, payments, receipts, phone numbers, etc.');
    console.log('⚠️  Estate data and plots will remain but be reset to available.\n');

    try {
        // Delete in correct order to respect foreign key constraints

        // 1. Delete payment plan installments
        console.log('1. Deleting payment plan installments...');
        const { error: installmentsError, count: installmentsCount } = await supabase
            .from('payment_plan_installments')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (installmentsError) console.error('Error:', installmentsError);
        else console.log(`   ✅ Deleted payment plan installments`);

        // 2. Delete payment plans
        console.log('2. Deleting payment plans...');
        const { error: plansError } = await supabase
            .from('payment_plans')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (plansError) console.error('Error:', plansError);
        else console.log('   ✅ Deleted payment plans');

        // 3. Delete receipts
        console.log('3. Deleting receipts...');
        const { error: receiptsError } = await supabase
            .from('receipts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (receiptsError) console.error('Error:', receiptsError);
        else console.log('   ✅ Deleted receipts');

        // 4. Delete payments
        console.log('4. Deleting payments...');
        const { error: paymentsError } = await supabase
            .from('payments')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (paymentsError) console.error('Error:', paymentsError);
        else console.log('   ✅ Deleted payments');

        // 5. Delete allocation reassignments
        console.log('5. Deleting allocation reassignments...');
        const { error: reassignmentsError } = await supabase
            .from('allocation_reassignments')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (reassignmentsError) console.error('Error:', reassignmentsError);
        else console.log('   ✅ Deleted allocation reassignments');

        // 6. Delete allocation plots (junction table)
        console.log('6. Deleting allocation plots...');
        const { error: allocPlotsError } = await supabase
            .from('allocation_plots')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (allocPlotsError) console.error('Error:', allocPlotsError);
        else console.log('   ✅ Deleted allocation plots');

        // 7. Delete allocations
        console.log('7. Deleting allocations...');
        const { error: allocationsError } = await supabase
            .from('allocations')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (allocationsError) console.error('Error:', allocationsError);
        else console.log('   ✅ Deleted allocations');

        // 8. Delete commission history
        console.log('8. Deleting commission history...');
        const { error: commissionError } = await supabase
            .from('commission_history')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (commissionError) console.error('Error:', commissionError);
        else console.log('   ✅ Deleted commission history');

        // 9. Delete customer documents
        console.log('9. Deleting customer documents...');
        const { error: docsError } = await supabase
            .from('documents')
            .delete()
            .not('customer_id', 'is', null);
        if (docsError) console.error('Error:', docsError);
        else console.log('   ✅ Deleted customer documents');

        // 10. Delete customer notes
        console.log('10. Deleting customer notes...');
        const { error: notesError } = await supabase
            .from('customer_notes')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (notesError) console.error('Error:', notesError);
        else console.log('   ✅ Deleted customer notes');

        // 11. Delete interaction logs
        console.log('11. Deleting interaction logs...');
        const { error: logsError } = await supabase
            .from('interaction_logs')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (logsError) console.error('Error:', logsError);
        else console.log('   ✅ Deleted interaction logs');

        // 12. Delete leads
        console.log('12. Deleting leads...');
        const { error: leadsError } = await supabase
            .from('leads')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (leadsError) console.error('Error:', leadsError);
        else console.log('   ✅ Deleted leads');

        // 13. Delete customer phone numbers (NEW)
        console.log('13. Deleting customer phone numbers...');
        const { error: phonesError } = await supabase
            .from('customer_phone_numbers')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (phonesError) console.error('Error:', phonesError);
        else console.log('   ✅ Deleted customer phone numbers');

        // 14. Delete customers
        console.log('14. Deleting customers...');
        const { error: customersError } = await supabase
            .from('customers')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (customersError) console.error('Error:', customersError);
        else console.log('   ✅ Deleted customers');

        // 15. Reset plots to available
        console.log('15. Resetting plots to available...');
        const { error: plotsError } = await supabase
            .from('plots')
            .update({
                status: 'available',
                customer_id: null
            })
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (plotsError) console.error('Error:', plotsError);
        else console.log('   ✅ Plots reset to available');

        // 16. Reset estate counters
        console.log('16. Resetting estate counters...');
        const { data: estates } = await supabase.from('estates').select('id');
        if (estates) {
            for (const estate of estates) {
                const { count: totalPlots } = await supabase
                    .from('plots')
                    .select('*', { count: 'exact', head: true })
                    .eq('estate_id', estate.id);

                await supabase
                    .from('estates')
                    .update({
                        occupied_plots: 0,
                        available_plots: totalPlots || 0
                    })
                    .eq('id', estate.id);
            }
            console.log('   ✅ Estate counters reset');
        }

        console.log('\n✅ COMPLETE customer data cleanup finished!');
        console.log('✅ All customer data has been deleted.');
        console.log('✅ Estate data and plots remain intact (plots reset to available).');

    } catch (error) {
        console.error('\n❌ Error during cleanup:', error);
        throw error;
    }
}

clearAllCustomerData();
