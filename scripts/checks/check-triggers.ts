
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    console.log("🔍 Calling debug_triggers...");

    const { data, error } = await supabase.rpc('debug_triggers');

    if (error) {
        console.error("❌ RPC Failed:", error);
    } else {
        console.log("✅ Hooks/Triggers:");
        console.table(data.filter((t: any) => t.table_name === 'allocations'));
        console.table(data);
    }
}

run();
