import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    // Get an allocation
    const { data: allocs } = await supabase.from('allocations').select('id').limit(1);
    if (!allocs || allocs.length === 0) {
        console.log('No allocations found to test with.');
        return;
    }
    const allocId = allocs[0].id;
    console.log('Testing with Allocation ID:', allocId);

    // Try insert plan
    const { data, error } = await supabase.from('payment_plans').insert({
        allocation_id: allocId,
        total_amount: 100000,
        plan_type: 'outright',
        status: 'completed'
    }).select();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Insert Success:', data);
    }
}
main();
