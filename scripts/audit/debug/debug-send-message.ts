
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Test payload - using a dummy phone number or the user's if known. 
// We'll use a generic one and expect a specific failure or success.
const payload = {
    recipient: "2347012345678", // Dummy
    channel: "sms",
    body: "Test message from debug script",
    userId: "noop"
};

console.log("Invoking send-message...");
const { data, error } = await supabase.functions.invoke('send-message', {
    body: payload
});

if (error) {
    console.error("Function Invocation Error:", error);
} else {
    console.log("Function Response:", data);
}
