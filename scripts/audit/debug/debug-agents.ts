
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAgents() {
    console.log("Checking recent profiles...");
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5);
    if (pError) console.error("Profile Error:", pError);
    else {
        console.log("Recent Profiles:");
        console.table(profiles?.map(p => ({
            id: p.id,
            email: p.email,
            role: p.role,
            is_staff: p.is_staff,
            created_at: p.created_at
        })));
    }

    console.log("\nChecking agents table...");
    const { data: agents, error: aError } = await supabase.from('agents').select('*, profiles(email, full_name, role)');
    if (aError) console.error("Agent Error:", aError);
    else {
        console.log(`Found ${agents?.length} agents.`);
        console.log(JSON.stringify(agents, null, 2));
    }
}

checkAgents();
