
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const TARGET_USERS = [
    {
        email: 'sysadmin@pinnaclegroups.ng',
        password: 'SysAdminPinnacle2025!',
        role: 'sysadmin',
        full_name: 'Pinnacle SysAdmin',
        phone: '+2348000000001',
    },
    {
        email: 'ceo@pinnaclegroups.ng',
        password: 'CeoPinnacle2025!',
        role: 'ceo',
        full_name: 'Pinnacle CEO',
        phone: '+2348000000002',
    },
    {
        email: 'md@pinnaclegroups.ng',
        password: 'MdPinnacle2025!',
        role: 'md',
        full_name: 'Pinnacle MD',
        phone: '+2348000000003',
    },
    {
        email: 'frontdesk@pinnaclegroups.ng',
        password: 'FrontDeskPinnacle2025!',
        role: 'frontdesk',
        full_name: 'Pinnacle FrontDesk',
        phone: '+2348000000004',
    }
];

async function createAdmins() {
    console.log('🚀 Creating Admin Accounts...');

    for (const user of TARGET_USERS) {
        // 1. Check if exists
        const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
        const existing = existingUsers.find(u => u.email === user.email);

        let userId = existing?.id;

        if (existing) {
            console.log(`ℹ️  User ${user.email} already exists. Updating password...`);
            await supabase.auth.admin.updateUserById(existing.id, {
                password: user.password,
                user_metadata: {
                    role: user.role,
                    full_name: user.full_name,
                    phone: user.phone
                }
            });
        } else {
            console.log(`👤 Creating ${user.email}...`);
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: {
                    role: user.role,
                    full_name: user.full_name,
                    phone: user.phone
                }
            });

            if (createError) {
                console.error(`❌ Failed to create ${user.email}:`, createError.message);
                continue;
            }
            userId = newUser.user.id;
        }

        // 2. Ensure Profile Exists
        if (userId) {
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: userId,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
                phone: user.phone,
                is_staff: true,
                email_verified: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

            if (profileError) {
                console.error(`❌ Failed to create/update profile for ${user.email}:`, profileError.message);
            } else {
                console.log(`✅ Profile synced for ${user.email}`);
            }
        }
    }

    console.log('✨ Admin creation complete.');
}

createAdmins();
