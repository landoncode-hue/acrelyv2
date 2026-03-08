import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
    const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Customer Count:', count);
    }

    // Check allocations too
    const { count: allocCount } = await supabase
        .from('allocations')
        .select('*', { count: 'exact', head: true });
    console.log('Allocation Count:', allocCount);

    // Check plans
    const { count: planCount } = await supabase
        .from('payment_plans')
        .select('*', { count: 'exact', head: true });
    console.log('Payment Plans Count:', planCount);
}

main();
