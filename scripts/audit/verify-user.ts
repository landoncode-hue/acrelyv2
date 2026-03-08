import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function verifyUser() {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const sysadmin = users.users.find(u => u.email === 'sysadmin@pinnaclegroups.ng');
    if (sysadmin) {
        console.log('✅ Sysadmin user found:', sysadmin.email, sysadmin.id);
    } else {
        console.log('❌ Sysadmin user NOT found');
        console.log('Available users:', users.users.map(u => u.email));
    }
}

verifyUser();
