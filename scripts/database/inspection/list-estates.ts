import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listEstates() {
    const { data: estates, error } = await supabase
        .from('estates')
        .select('id, name, location, status, is_test');

    if (error) {
        console.error('Error fetching estates:', error);
        return;
    }

    console.log('Estates:');
    console.table(estates);
}

listEstates();
