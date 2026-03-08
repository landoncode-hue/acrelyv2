
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- JULIET ---');
    const { data: juliet } = await supabase
        .from('customers')
        .select('*')
        .ilike('full_name', '%JULIET CHIAMAKA EZE%')
        .maybeSingle(); // changing to maybeSingle to avoid null error
    console.log('Customer:', juliet);

    console.log('\n--- ALABOR (Allocation Check) ---');
    const { data: alabor } = await supabase
        .from('customers')
        .select('id, full_name, allocations(*)')
        .ilike('full_name', '%ALABOR BRIGHT%')
        .maybeSingle();
    console.log('Alabor w/ Allocations:', JSON.stringify(alabor, null, 2));
}

check();
