
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Invoking approve-allocation with dummy token...");

    // We expect this to fail with "Unauthorized" (400) if the function is running.
    // If it returns 500, then the function itself is broken (imports etc).
    const { data, error } = await supabase.functions.invoke('approve-allocation', {
        body: { allocation_id: 'dummy' },
        headers: { Authorization: 'Bearer invalid-token' }
    });

    if (error) {
        console.log("Function Invocation Error Status:", error?.context?.status);
        if (error?.context?.status === 400) {
            console.log("SUCCESS: Function is reachable but rejected invalid token (Expected behavior)");
        } else {
            console.log("FAILURE: Function returned status", error?.context?.status);
        }
    } else {
        console.log("Function Response:", data);
    }
}

main();
