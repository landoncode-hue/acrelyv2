import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    const { count: estates } = await supabase.from('estates').select('*', { count: 'exact', head: true });
    const { count: customers } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    const { count: allocations } = await supabase.from('allocations').select('*', { count: 'exact', head: true });
    const { count: payments } = await supabase.from('payments').select('*', { count: 'exact', head: true });

    console.log(`Progress Check:`);
    console.log(`Estates: ${estates}`);
    console.log(`Customers: ${customers}`);
    console.log(`Allocations: ${allocations}`);
    console.log(`Payments: ${payments}`);

    // List estates by name
    const { data: estateList } = await supabase.from('estates').select('name, total_plots, available_plots');
    console.log('\nEstates Created:');
    estateList?.forEach(e => console.log(`- ${e.name} (Total: ${e.total_plots}, Avail: ${e.available_plots})`));
}

main();
