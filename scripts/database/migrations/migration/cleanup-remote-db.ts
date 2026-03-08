import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// removed missing type import

dotenv.config();
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient<any>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('WARNING: This will DELETE ALL business data from the remote database.');
    console.log('Tables: payments, allocations, plots, estates, customers.');
    console.log('Preserved: profiles (auth users).');

    // We cannot use TRUNCATE via client easily without RPC, so we use delete().
    // Order matters due to FK constraints.

    console.log('Deleting Payments...');
    const { error: err1 } = await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all
    if (err1) console.error('Error deleting payments:', err1);

    console.log('Deleting Allocations...');
    const { error: err2 } = await supabase.from('allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err2) console.error('Error deleting allocations:', err2);

    console.log('Deleting Plots...');
    const { error: err3 } = await supabase.from('plots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err3) console.error('Error deleting plots:', err3);

    console.log('Deleting Estates...');
    const { error: err4 } = await supabase.from('estates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err4) console.error('Error deleting estates:', err4);

    console.log('Deleting Customers...');
    const { error: err5 } = await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err5) console.error('Error deleting customers:', err5);

    console.log('Cleanup complete.');
}

main().catch(console.error);
