import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugReceipt() {
    const paymentId = 'bfce77d2-3726-4dc0-971f-a1a97f12f874';

    console.log(`Checking receipt for Payment ID: ${paymentId}`);

    const { data: receipt, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('payment_id', paymentId)
        .single();

    if (error) {
        console.error('Error fetching receipt:', error);
        return;
    }

    if (!receipt) {
        console.log('No receipt found for this payment.');
        return;
    }

    console.log('Receipt Found:', receipt);
    console.log('Receipt URL:', receipt.receipt_url);

    // Verify if we can create a signed URL using this path
    const { data: signedData, error: signedError } = await supabase
        .storage
        .from('receipts')
        .createSignedUrl(receipt.receipt_url, 60);

    if (signedError) {
        console.error('Error creating signed URL:', signedError);
    } else {
        console.log('Successfully generated signed URL:', signedData?.signedUrl);
    }
}

debugReceipt();
