
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Invoking send-broadcast...");
    // We'll try 'all_leads' as that's likely what the user tested.
    // If there are no leads, it will return count: 0.
    const { data, error } = await supabase.functions.invoke('send-broadcast', {
        body: {
            recipientType: 'all_leads',
            message: 'Debug Broadcast Test',
            estateId: null
        }
    });

    if (error) {
        console.error("Function Invocation Error:", error);
    } else {
        console.log("Function Response:", JSON.stringify(data, null, 2));
    }
}

main();
