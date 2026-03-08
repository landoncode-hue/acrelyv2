import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
    console.log("🔍 Verifying Seeded Data...");

    // Check Profiles
    const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .like("email", "%@pinnaclegroups.ng");

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
    } else {
        console.log(`✅ Found ${profiles.length} Executive Profiles:`);
        console.table(profiles?.map(p => ({
            email: p.email,
            role: p.role,
            is_staff: p.is_staff,
            created_at: p.created_at
        })));
    }

    // Check Auth Users (Admin API)
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error("Error fetching auth users:", authError);
    } else {
        const executives = users.filter(u => u.email?.endsWith("@pinnaclegroups.ng"));
        console.log(`✅ Found ${executives.length} Executive Auth Accounts:`);
        console.table(executives.map(u => ({
            id: u.id,
            email: u.email,
            last_sign_in: u.last_sign_in_at
        })));
    }
}

verify();
