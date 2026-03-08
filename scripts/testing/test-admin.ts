
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdmin() {
    console.log("👮 Testing Admin API Access...");

    // 1. List Users
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 5 });

    if (listError) {
        console.error("❌ Admin List Users Failed:");
        console.error(`   Message: ${listError.message}`);
        console.error(`   Status: ${listError.status}`);
    } else {
        console.log(`✅ Admin List Users Success. Found ${listData.users.length} users.`);
    }

    // 2. Get User by Email (CEO)
    const email = "ceo@pinnaclegroups.ng";
    // We can't get by email directly in admin api easily without listing, 
    // but let's try to update password which implies finding them.

    // Actually, let's just create a dummy user to see if Writes work?
    // Or try to Invite?

    console.log("👮 Testing Admin Invite (Checks Write Permissions)...");
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail("test_probe@example.com");

    if (inviteError) {
        console.error("❌ Admin Invite Failed:");
        console.error(`   Message: ${inviteError.message}`);
    } else {
        console.log("✅ Admin Invite Success (Write Access OK).");
        // Clean up
        if (inviteData.user) {
            await supabase.auth.admin.deleteUser(inviteData.user.id);
            console.log("   (Cleaned up test user)");
        }
    }
}

testAdmin();
