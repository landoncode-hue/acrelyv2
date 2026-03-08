import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function debugCustomers() {
    const { data: customers, error } = await supabase.from('customers').select('*');
    if (error) console.error(error);
    else {
        console.log(`Found ${customers.length} customers.`);
        console.log(customers.slice(0, 3));
    }
}

debugCustomers();
