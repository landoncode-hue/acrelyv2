import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function listEstates() {
    const { data, error } = await supabase.from('estates').select('id, name, code');
    if (error) {
        console.error('Error fetching estates:', error);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}

listEstates();
