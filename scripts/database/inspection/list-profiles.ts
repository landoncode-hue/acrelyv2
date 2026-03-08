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

async function listUsers() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, is_staff');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log('Profiles:');
    console.table(profiles);
}

listUsers();
