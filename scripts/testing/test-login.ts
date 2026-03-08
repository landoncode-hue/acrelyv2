
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
    console.log("🔐 Testing Login for CEO Account...");
    const email = "ceo@pinnaclegroups.ng";
    const password = "CeoPinnacle2025!";

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("❌ Login Failed:");
        console.error(`   Message: ${error.message}`);
        console.error(`   Status: ${error.status}`);
        return;
    }

    if (data.session) {
        console.log("✅ Login Successful!");
        console.log(`   User ID: ${data.user.id}`);
        console.log(`   Email: ${data.user.email}`);
        console.log(`   Role: ${data.user.role}`);
        console.log("   Session Access Token (truncated):", data.session.access_token.substring(0, 20) + "...");
    } else {
        console.warn("⚠️ Login succeeded but no session returned (Email not confirmed?)");
    }
}

testLogin();
