
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const USERS = [
    {
        email: 'sysadmin@pinnaclegroups.ng',
        password: 'SysAdminPinnacle2025!',
        full_name: 'System Administrator',
        role: 'sysadmin',
    },
    {
        email: 'ceo@pinnaclegroups.ng',
        password: 'CeoPinnacle2025!',
        full_name: 'Chief Executive Officer',
        role: 'ceo',
    },
    {
        email: 'md@pinnaclegroups.ng',
        password: 'MdPinnacle2025!',
        full_name: 'Managing Director',
        role: 'md',
    },
    {
        email: 'frontdesk@pinnaclegroups.ng',
        password: 'FrontDeskPinnacle2025!',
        full_name: 'Front Desk Staff',
        role: 'frontdesk',
    }
];

async function seedUsers() {
    console.log("🌱 Seeding Users (Email/Password Only)...");

    // Fetch all users to check duplications
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    if (listError) {
        console.error("Error listing users:", listError);
        return;
    }

    for (const user of USERS) {
        console.log(`Processing ${user.full_name} (${user.role})...`);
        let userId;

        const existingUser = existingUsers?.users.find(
            (u) => u.email === user.email
        );

        if (existingUser) {
            console.log(`  User already exists: ${existingUser.id}`);
            userId = existingUser.id;
        } else {
            const { data, error } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: { full_name: user.full_name },
            });

            if (error) {
                console.error(`  Error creating user:`, error);
                continue;
            }
            userId = data.user.id;
            console.log(`  Created user: ${userId}`);
        }


        // 2. Upsert Profile (Ensure it exists even if trigger failed)
        const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
                id: userId,
                role: user.role,
                full_name: user.full_name,
                email: user.email,
                is_staff: ["sysadmin", "ceo", "md", "frontdesk"].includes(user.role),
            }, { onConflict: 'id' });

        if (profileError) {
            console.error(`  Error upserting profile: ${profileError.message}`);
        } else {
            console.log(`  Profile upserted with role: ${user.role}`);
        }
    }

    console.log("✅ Seeding complete.");
}

seedUsers();
