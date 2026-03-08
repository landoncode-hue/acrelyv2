
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log('🧹 Starting Legacy Data Cleanup...');

    // 1. Find Legacy Customers
    const { data: customers, error: custError } = await supabase
        .from('customers')
        .select('id')
        .ilike('email', '%@legacy.acrely.africa');

    if (custError) {
        console.error('Error fetching customers:', custError);
        return;
    }

    if (!customers || customers.length === 0) {
        console.log('No legacy customers found.');
        return;
    }

    const customerIds = customers.map(c => c.id);
    console.log(`Found ${customerIds.length} legacy customers.`);

    // 2. Delete Payments
    const { error: payError } = await supabase
        .from('payments')
        .delete()
        .in('customer_id', customerIds);

    if (payError) console.error('Error deleting payments:', payError);
    else console.log('✅ Payments deleted.');

    // 3. Find Allocations (to get IDs for Plans)
    const { data: allocations } = await supabase
        .from('allocations')
        .select('id')
        .in('customer_id', customerIds);

    const allocationIds = allocations?.map(a => a.id) || [];

    if (allocationIds.length > 0) {
        // 4. Delete Payment Plans
        const { error: planError } = await supabase
            .from('payment_plans')
            .delete()
            .in('allocation_id', allocationIds);

        if (planError) console.error('Error deleting plans:', planError);
        else console.log('✅ Payment Plans deleted.');

        // 5. Delete Allocations
        const { error: allocError } = await supabase
            .from('allocations')
            .delete()
            .in('id', allocationIds);

        if (allocError) console.error('Error deleting allocations:', allocError);
        else console.log('✅ Allocations deleted.');
    }

    // 6. Delete Customers
    const { error: delCustError } = await supabase
        .from('customers')
        .delete()
        .in('id', customerIds);

    if (delCustError) console.error('Error deleting customers:', delCustError);
    else console.log('✅ Customers deleted.');

    // 7. Cleanup Placeholder Plots
    // Plots created with "Unassigned-" or "Draft-"
    const { data: junkPlots } = await supabase
        .from('plots')
        .select('id')
        .or('plot_number.ilike.Unassigned-%,plot_number.ilike.Draft-%');

    const junkPlotIds = junkPlots?.map(p => p.id) || [];

    if (junkPlotIds.length > 0) {
        const { error: plotError } = await supabase
            .from('plots')
            .delete()
            .in('id', junkPlotIds);

        if (plotError) console.error('Error deleting junk plots:', plotError);
        else console.log(`✅ Deleted ${junkPlotIds.length} junk plots.`);
    }

    console.log('🎉 Cleanup Complete.');
}

main();
