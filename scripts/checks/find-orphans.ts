
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrphans() {
    console.log("Checking for profiles with role 'agent' but no agent record...");

    // Get all agent profiles
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, created_at').eq('role', 'agent');

    if (!profiles || profiles.length === 0) {
        console.log("No agent profiles found.");
        return;
    }

    console.log(`Found ${profiles.length} agent profiles.`);

    // Get all agent records
    const { data: agents } = await supabase.from('agents').select('profile_id');
    const agentProfileIds = new Set(agents?.map(a => a.profile_id));

    const orphans = profiles.filter(p => !agentProfileIds.has(p.id));

    if (orphans.length > 0) {
        console.log("Found Orphaned Agents (Missing from agents table):");
        console.table(orphans);
    } else {
        console.log("No orphaned agents found. All agent profiles have agent records.");
    }
}

checkOrphans();
