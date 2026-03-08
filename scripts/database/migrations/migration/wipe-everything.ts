import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function wipeEverything() {
    console.log('🗑️  Starting COMPLETE data wipe (including estates)...\n');

    try {
        // 1. Delete payment plans
        const { error: plansError } = await supabase.from('payment_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (plansError) throw plansError;
        console.log('✅ Deleted payment plans.');

        // 3. Delete payments
        const { error: paymentsError } = await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (paymentsError) throw paymentsError;
        console.log('✅ Deleted payments.');

        // 4. Delete allocations
        const { error: allocationsError } = await supabase.from('allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (allocationsError) throw allocationsError;
        console.log('✅ Deleted allocations.');

        // 5. Delete leads
        const { error: leadsError } = await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (leadsError) throw leadsError;
        console.log('✅ Deleted leads.');

        // 6. Delete customer phone numbers
        const { error: phonesError } = await supabase.from('customer_phone_numbers').delete().neq('customer_id', '00000000-0000-0000-0000-000000000000');
        if (phonesError) throw phonesError;
        console.log('✅ Deleted customer phone numbers.');

        // 7. Delete customers
        const { error: customersError } = await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (customersError) throw customersError;
        console.log('✅ Deleted customers.');

        // 8. Delete receipts
        const { error: receiptsError } = await supabase.from('receipts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (receiptsError) throw receiptsError;
        console.log('✅ Deleted receipts.');

        // 9. Delete plots
        const { error: plotsError } = await supabase.from('plots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (plotsError) throw plotsError;
        console.log('✅ Deleted plots.');

        // 10. Delete estates
        const { error: estatesError } = await supabase.from('estates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (estatesError) throw estatesError;
        console.log('✅ Deleted estates.');

        console.log('\n✅ COMPLETE wipe finished. Database is now empty.');
    } catch (error) {
        console.error('❌ Error during wipe:', error);
        process.exit(1);
    }
}

wipeEverything();
