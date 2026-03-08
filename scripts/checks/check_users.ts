import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Error fetching auth users:', authError);
    } else {
        console.log(`Auth Users Count: ${authUsers.users.length}`);
        authUsers.users.forEach(user => console.log(`- ${user.email} (${user.id})`));
    }

    const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
    if (profileError) {
        console.error('Error fetching profiles:', profileError);
    } else {
        console.log(`Profiles Count: ${profiles.length}`);
    }
}

checkUsers();
