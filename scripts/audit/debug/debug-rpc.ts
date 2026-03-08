
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
    console.log("Testing get_estate_sales_performance...");
    const { data: estates, error } = await supabase.rpc('get_estate_sales_performance');

    if (error) {
        console.error("RPC Error:", error);
    } else {
        console.log(`RPC Success. Returned ${estates?.length} records.`);
        console.log(JSON.stringify(estates, null, 2));
    }

    console.log("\nChecking estates table directly...");
    const { data: rawEstates, error: rawError } = await supabase.from('estates').select('*');
    if (rawError) console.error("Table Error:", rawError);
    else console.log(`Table has ${rawEstates?.length} records.`);

    // Check enum
    const { data: enumData, error: enumError } = await supabase.rpc('debug_enums');
    if (enumError) console.error("Enum Error:", enumError);
    else console.log("Valid Allocation Statuses:", enumData);

    console.log("Checking payment statuses...");
    // Check distinct payment statuses from table, as payment status might be text or enum.
    const { data: payData, error: payError } = await supabase.from('payments').select('status');
    if (payError) console.error("Payment Error:", payError);
    else {
        const statuses = [...new Set(payData?.map(p => p.status))];
        console.log("Existing Payment Statuses:", statuses);
    }

}

testRpc();

