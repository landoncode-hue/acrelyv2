import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCustomer() {
    const customerId = '13a50771-13c6-4563-b294-0271c1a63af4';
    console.log(`Checking customer: ${customerId}`);

    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

    if (customerError) {
        console.error('Customer Error:', customerError.message);
    } else {
        console.log('Customer Found:', customer);
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .maybeSingle();

    if (profileError) {
        console.error('Profile Error:', profileError.message);
    } else {
        console.log('Profile Found:', profile);
    }
    console.log('--- Testing RPC ---');
    const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_customer_financial_summary', { customer_uuid: customerId });

    if (rpcError) {
        console.error('RPC Error:', rpcError.message);
        console.error('RPC Error Details:', rpcError);
    } else {
        console.log('RPC Success:', rpcData);
    }
}

checkCustomer();
