
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log('📊 Verifying Database Counts...\n');

    const { count: payments, error: pErr } = await supabase.from('payments').select('*', { count: 'exact', head: true });
    const { count: allocations, error: aErr } = await supabase.from('allocations').select('*', { count: 'exact', head: true });
    const { count: customers, error: cErr } = await supabase.from('customers').select('*', { count: 'exact', head: true });

    // Also sum payments to see total value
    const { data: paymentSum } = await supabase.from('payments').select('amount');
    const totalValue = paymentSum?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    console.log(`Payments:    ${payments}`);
    console.log(`Allocations: ${allocations}`);
    console.log(`Customers:   ${customers}`);
    console.log(`Total Value: ₦${totalValue.toLocaleString()}`);
}

main().catch(console.error);
