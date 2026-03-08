import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const allocationId = '271b0da4-c116-402f-bc42-fea4b1539cf3';

async function checkAllocation() {
    console.log(`Checking allocation: ${allocationId}`);

    const { data: allocation, error } = await supabase
        .from('allocations')
        .select('*, estates(*), payment_plans(*)')
        .eq('id', allocationId)
        .single();

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('Allocation Info:', {
        id: allocation.id,
        total_price: allocation.total_price,
        amount_paid: allocation.amount_paid,
        net_price: allocation.net_price,
        status: allocation.status,
        estate_price: (allocation.estates as any)?.price
    });

    const { data: payments, error: pError } = await supabase
        .from('payments')
        .select('*')
        .eq('allocation_id', allocationId);

    if (pError) {
        console.error('Error fetching payments:', pError.message);
        return;
    }

    console.log(`Verified Payments count: ${payments?.filter(p => p.status === 'verified').length || 0}`);
    const totalVerified = payments?.filter(p => p.status === 'verified').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    console.log(`Total amount verified: ${totalVerified}`);
}

checkAllocation();
