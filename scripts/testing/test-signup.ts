
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
    console.log("🆕 Testing Signup...");
    const email = `test_${Date.now()}@example.com`;
    const password = "TestPassword123!";

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error("❌ Signup Failed:", error);
    } else {
        console.log("✅ Signup Successful!");
        console.log("   User ID:", data.user?.id);
    }
}

testSignup();
