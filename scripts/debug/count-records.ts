import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function count() {
    const { count: customers } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    const { count: allocations } = await supabase.from('allocations').select('*', { count: 'exact', head: true });
    const { count: payments } = await supabase.from('payments').select('*', { count: 'exact', head: true });

    console.log(`Customers: ${customers}`);
    console.log(`Allocations: ${allocations}`);
    console.log(`Payments: ${payments}`);
}

count();
