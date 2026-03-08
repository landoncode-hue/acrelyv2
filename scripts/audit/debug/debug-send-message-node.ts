
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""; // Use ANON key for invoke

console.log("URL:", supabaseUrl);
console.log("Key Length:", supabaseKey.length);

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Invoking send-message...");
    const { data, error } = await supabase.functions.invoke('send-message', {
        body: {
            recipient: "23470fake",
            channel: "sms",
            body: "Test message from debug script",
            userId: "noop"
        }
    });

    if (error) {
        console.error("Function Invocation Error:", error);
    } else {
        console.log("Function Response:", data);
    }
}

main();
