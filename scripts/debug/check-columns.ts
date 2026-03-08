import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkColumns() {
    console.log('Checking plots columns...');
    const { data, error } = await supabase
        .from('plots')
        .select('id, half_a_allocation_id, half_b_allocation_id')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Columns exist!');
    }
}

checkColumns();
