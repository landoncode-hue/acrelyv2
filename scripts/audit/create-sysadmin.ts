import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function createSysAdmin() {
    const email = 'sysadmin@pinnaclegroups.ng';
    const password = 'SysAdminPinnacle2025!';

    // Check if exists
    const { data: users } = await supabase.auth.admin.listUsers();
    const existing = users.users.find(u => u.email === email);

    if (existing) {
        console.log('User already exists, updating password...');
        const { error } = await supabase.auth.admin.updateUserById(existing.id, { password: password });
        if (error) console.error('Error updating password:', error);
        else console.log('✅ Password updated.');
    } else {
        console.log('Creating user...');
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: 'System Admin',
                role: 'sysadmin' // Ensure role is set for RBAC
            }
        });

        if (error) console.error('Error creating user:', error);
        else {
            console.log('✅ User created:', data.user.id);
            // Ensure profile exists if needed (triggers usually handle this)
        }
    }
}

createSysAdmin();
