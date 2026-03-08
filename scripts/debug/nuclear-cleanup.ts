import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function nuclearOption() {
    console.log('☢️  Nuclear option engaged...');

    // 1. Get ALL plot IDs
    const { data: allPlots } = await supabase.from('plots').select('id');
    if (allPlots && allPlots.length > 0) {
        console.log(`Found ${allPlots.length} plots to neutralize.`);

        // chunk updates
        const chunkSize = 50;
        for (let i = 0; i < allPlots.length; i += chunkSize) {
            const batch = allPlots.slice(i, i + chunkSize).map(p => p.id);
            const { error } = await supabase.from('plots')
                .update({ half_a_allocation_id: null, half_b_allocation_id: null })
                .in('id', batch);

            if (error) console.error('Error neutralization batch:', error.message);
        }
    }

    // 2. Delete Payments and Plans FIRST (Depend on Allocations)
    console.log('Deleting payments...');
    await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting plan installments...');
    await supabase.from('payment_plan_installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting plans...');
    await supabase.from('payment_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting allocation_plots junction...');
    await supabase.from('allocation_plots').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 3. Now try delete all allocations
    console.log('Deleting allocations...');
    const { error: allocError } = await supabase.from('allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (allocError) console.error('Alloc delete error:', allocError.message);

    // 4. Now delete plots
    console.log('Deleting plots...');
    const { error: plotError } = await supabase.from('plots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (plotError) console.error('Plot delete error:', plotError.message);

    // 5. Delete Estates
    console.log('Deleting estates...');
    const { error: estError } = await supabase.from('estates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (estError) console.error('Estate delete error:', estError.message);

    // 6. Delete Leads
    console.log('Deleting leads...');
    const { error: leadError } = await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (leadError) console.error('Lead delete error:', leadError.message);

    // 7. Delete Customers
    console.log('Deleting customers...');
    const { error: custError } = await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (custError) console.error('Customer delete error:', custError.message);

    console.log('☢️  Nuclear sequence complete.');
}

nuclearOption();
