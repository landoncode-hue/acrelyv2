import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
    console.log("🔍 Verifying Seeded Profiles...");

    const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("email, role, full_name, is_staff")
        .like("email", "%@pinnaclegroups.ng");

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
    } else {
        console.log(`✅ Found ${profiles.length} Executive Profiles:`);
        console.table(profiles);
    }
}

verify();
