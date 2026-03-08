import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function clearCustomerData() {
    console.log('🗑️  Starting Customer Data Cleanup...\n');
    console.log('⚠️  WARNING: This will delete ALL customer-related data!');
    console.log('⚠️  Estate data will NOT be touched.\n');

    try {
        // Delete in correct order to respect foreign key constraints

        // 1. Delete payment plan installments first
        console.log('1. Deleting payment plan installments...');
        const { error: installmentsError } = await supabase
            .from('payment_plan_installments')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        if (installmentsError) console.error('Error deleting installments:', installmentsError);
        else console.log('   ✅ Payment plan installments deleted');

        // 2. Delete payment plans
        console.log('2. Deleting payment plans...');
        const { error: plansError } = await supabase
            .from('payment_plans')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (plansError) console.error('Error deleting payment plans:', plansError);
        else console.log('   ✅ Payment plans deleted');

        // 3. Get all payment IDs that have receipts (to preserve)
        console.log('3. Identifying payments with receipts...');
        const { data: receiptsData } = await supabase
            .from('receipts')
            .select('payment_id, allocation_id, customer_id');

        const paymentIdsWithReceipts = new Set(receiptsData?.map(r => r.payment_id).filter(Boolean) || []);
        const allocationIdsWithReceipts = new Set(receiptsData?.map(r => r.allocation_id).filter(Boolean) || []);
        const customerIdsWithReceipts = new Set(receiptsData?.map(r => r.customer_id).filter(Boolean) || []);

        console.log(`   📋 Found ${paymentIdsWithReceipts.size} payments with receipts`);
        console.log(`   📋 Found ${allocationIdsWithReceipts.size} allocations with receipts`);
        console.log(`   📋 Found ${customerIdsWithReceipts.size} customers with receipts`);

        // 4. Delete payments WITHOUT receipts
        console.log('4. Deleting payments without receipts...');
        const { data: allPayments } = await supabase
            .from('payments')
            .select('id');

        const paymentsToDelete = allPayments?.filter(p => !paymentIdsWithReceipts.has(p.id)) || [];

        if (paymentsToDelete.length > 0) {
            for (const payment of paymentsToDelete) {
                await supabase.from('payments').delete().eq('id', payment.id);
            }
            console.log(`   ✅ Deleted ${paymentsToDelete.length} payments without receipts`);
        } else {
            console.log('   ℹ️  No payments without receipts to delete');
        }

        // 5. Delete allocation reassignments
        console.log('5. Deleting allocation reassignments...');
        const { error: reassignmentsError } = await supabase
            .from('allocation_reassignments')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (reassignmentsError) console.error('Error deleting reassignments:', reassignmentsError);
        else console.log('   ✅ Allocation reassignments deleted');

        // 6. Delete allocation plots (junction table)
        console.log('6. Deleting allocation plots...');
        const { error: allocPlotsError } = await supabase
            .from('allocation_plots')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (allocPlotsError) console.error('Error deleting allocation plots:', allocPlotsError);
        else console.log('   ✅ Allocation plots deleted');

        // 7. Delete allocations WITHOUT receipts
        console.log('7. Deleting allocations without receipts...');
        const { data: allAllocations } = await supabase
            .from('allocations')
            .select('id');

        const allocationsToDelete = allAllocations?.filter(a => !allocationIdsWithReceipts.has(a.id)) || [];

        if (allocationsToDelete.length > 0) {
            for (const allocation of allocationsToDelete) {
                await supabase.from('allocations').delete().eq('id', allocation.id);
            }
            console.log(`   ✅ Deleted ${allocationsToDelete.length} allocations without receipts`);
        } else {
            console.log('   ℹ️  No allocations without receipts to delete');
        }

        // 8. Delete commission history
        console.log('8. Deleting commission history...');
        const { error: commissionError } = await supabase
            .from('commission_history')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (commissionError) console.error('Error deleting commission history:', commissionError);
        else console.log('   ✅ Commission history deleted');

        // 9. Delete customer documents
        console.log('9. Deleting customer documents...');
        const { error: docsError } = await supabase
            .from('documents')
            .delete()
            .not('customer_id', 'is', null);
        if (docsError) console.error('Error deleting documents:', docsError);
        else console.log('   ✅ Customer documents deleted');

        // 10. Delete customer notes
        console.log('10. Deleting customer notes...');
        const { error: notesError } = await supabase
            .from('customer_notes')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (notesError) console.error('Error deleting customer notes:', notesError);
        else console.log('   ✅ Customer notes deleted');

        // 11. Delete interaction logs
        console.log('11. Deleting interaction logs...');
        const { error: logsError } = await supabase
            .from('interaction_logs')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (logsError) console.error('Error deleting interaction logs:', logsError);
        else console.log('   ✅ Interaction logs deleted');

        // 12. Delete leads
        console.log('12. Deleting leads...');
        const { error: leadsError } = await supabase
            .from('leads')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (leadsError) console.error('Error deleting leads:', leadsError);
        else console.log('   ✅ Leads deleted');

        // 13. Reset plots to available (don't delete plots, they belong to estates)
        console.log('13. Resetting plots to available...');
        const { error: plotsError } = await supabase
            .from('plots')
            .update({
                status: 'available',
                customer_id: null
            })
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (plotsError) console.error('Error resetting plots:', plotsError);
        else console.log('   ✅ Plots reset to available');

        // 14. Delete customers WITHOUT receipts
        console.log('14. Deleting customers without receipts...');
        const { data: allCustomers } = await supabase
            .from('customers')
            .select('id');

        const customersToDelete = allCustomers?.filter(c => !customerIdsWithReceipts.has(c.id)) || [];

        if (customersToDelete.length > 0) {
            for (const customer of customersToDelete) {
                await supabase.from('customers').delete().eq('id', customer.id);
            }
            console.log(`   ✅ Deleted ${customersToDelete.length} customers without receipts`);
        } else {
            console.log('   ℹ️  No customers without receipts to delete');
        }

        // 15. Report on preserved data
        console.log('\n📋 PRESERVED DATA:');
        console.log(`   ✅ ${paymentIdsWithReceipts.size} payments with receipts`);
        console.log(`   ✅ ${allocationIdsWithReceipts.size} allocations with receipts`);
        console.log(`   ✅ ${customerIdsWithReceipts.size} customers with receipts`);
        console.log(`   ✅ ${receiptsData?.length || 0} receipts`);

        // 15. Reset estate counters
        console.log('15. Resetting estate counters...');
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

        console.log('\n✅ Customer data cleanup completed successfully!');
        console.log('✅ Estate data remains intact.');

    } catch (error) {
        console.error('\n❌ Error during cleanup:', error);
        throw error;
    }
}

clearCustomerData();
