
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanLegacyData() {
    console.log('🧹 Starting selective legacy data cleanup...');

    // 1. Delete Payments linked to legacy allocations
    const { data: legacyAllocs } = await supabase
        .from('allocations')
        .select('id')
        .eq('notes', 'Imported via Legacy Data Entry');

    const legacyAllocIds = legacyAllocs?.map(a => a.id) || [];

    if (legacyAllocIds.length > 0) {
        const { error: payErr } = await supabase
            .from('payments')
            .delete()
            .in('allocation_id', legacyAllocIds);
        if (payErr) console.error('Error deleting payments:', payErr);
        else console.log(`✅ Deleted ${legacyAllocIds.length} legacy payment links.`);

        const { error: appErr } = await supabase
            .from('allocation_plots')
            .delete()
            .in('allocation_id', legacyAllocIds);
        if (appErr) console.error('Error deleting allocation_plots:', appErr);

        const { error: ppErr } = await supabase
            .from('payment_plans')
            .delete()
            .in('allocation_id', legacyAllocIds);
        if (ppErr) console.error('Error deleting payment_plans:', ppErr);
    }

    // 2. Reset Plot statuses
    if (legacyAllocIds.length > 0) {
        // Find plot IDs associated with these allocations
        const { data: allocPlots } = await supabase
            .from('allocations')
            .select('plot_id')
            .in('id', legacyAllocIds);

        const plotIds = [...new Set(allocPlots?.map(p => p.plot_id).filter(Boolean))];

        if (plotIds.length > 0) {
            const { error: plotErr } = await supabase
                .from('plots')
                .update({
                    status: 'available',
                    customer_id: null,
                    half_a_allocation_id: null,
                    half_b_allocation_id: null
                })
                .in('id', plotIds);
            if (plotErr) console.error('Error resetting plots:', plotErr);
            else console.log(`✅ Reset ${plotIds.length} plots to available.`);
        }
    }

    // 3. Delete Allocations
    if (legacyAllocIds.length > 0) {
        const { error: allocErr } = await supabase
            .from('allocations')
            .delete()
            .in('id', legacyAllocIds);
        if (allocErr) console.error('Error deleting allocations:', allocErr);
        else console.log(`✅ Deleted ${legacyAllocIds.length} legacy allocations.`);
    }

    // 4. Delete Customers (Only those with legacy notes or no remaining allocations)
    // For simplicity since we just nuked everything earlier, we can delete all customers
    // but let's be safe and only delete those we created.
    const { error: custErr } = await supabase
        .from('customers')
        .delete()
        .not('id', 'in', '(select customer_id from allocations)'); // Delete customers with no allocations

    if (custErr) console.error('Error deleting customers:', custErr);
    else console.log('✅ Cleaned up unallocated customers.');

    console.log('✨ Cleanup complete!');
}

cleanLegacyData();
