
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAgentSignup() {
    const email = `test_agent_${Date.now()}@example.com`;
    const password = 'Password123!';
    console.log(`Creating test user: ${email}`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: "Test Agent",
            phone: "+1234567890",
            role: "agent",
            is_agent_applicant: true,
            application_metadata: {
                experience: "5",
                address: "123 Test St",
                bio: "Automated test agent"
            }
        }
    });

    if (error) {
        console.error("Signup Error:", error);
        return;
    }

    console.log("User created:", data.user.id);
    console.log("Waiting for trigger...");
    await new Promise(r => setTimeout(r, 2000));

    // Check profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    console.log("Profile:", profile);

    // Check agent
    const { data: agent } = await supabase.from('agents').select('*').eq('profile_id', data.user.id).single();
    console.log("Agent Record:", agent);

    if (!agent) {
        console.error("FAILED: Agent record not created.");
    } else {
        console.log("SUCCESS: Agent record created.");
    }
}

testAgentSignup();
