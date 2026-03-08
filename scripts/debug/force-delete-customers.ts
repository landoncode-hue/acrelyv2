import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function forceDelete() {
    console.log('Force deleting customers...');

    // First clear any references we might have missed
    // e.g. plots.customer_id
    await supabase.from('plots').update({ customer_id: null }).neq('id', '00000000-0000-0000-0000-000000000000');

    const { data, error } = await supabase
        .from('customers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select('*');

    if (error) {
        console.error('Error deleting customers:', error);
    } else {
        console.log(`Deleted ${data?.length || 0} customers.`);
    }
}

forceDelete();
