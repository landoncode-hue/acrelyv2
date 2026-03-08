
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function countCustomers() {
    const { count } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    console.log(`Total Customers: ${count}`);
}
countCustomers();
