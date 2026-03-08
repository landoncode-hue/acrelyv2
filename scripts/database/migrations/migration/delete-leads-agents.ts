import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Create Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    console.log('--- STARTING CLEANUP: LEADS & AGENTS ---');

    // 1. Delete all Leads
    console.log('Deleting all LEADS...');
    const { error: leadsError, count: leadsCount } = await supabase
        .from('leads')
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (leadsError) {
        console.error('Error deleting leads:', leadsError);
    } else {
        console.log(`Deleted ${leadsCount} leads.`);
    }

    // 2. Identify Agents to Delete
    console.log('Fetching AGENT profiles...');
    const { data: agentProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('role', 'agent');

    if (profileError) {
        console.error('Error fetching agent profiles:', profileError);
    } else if (agentProfiles && agentProfiles.length > 0) {
        console.log(`Found ${agentProfiles.length} agents. Deleting users...`);

        for (const agent of agentProfiles) {
            console.log(`Deleting agent: ${agent.full_name} (${agent.email})...`);
            const { error: deleteUserError } = await supabase.auth.admin.deleteUser(agent.id);

            if (deleteUserError) {
                console.error(`Failed to delete user ${agent.id}:`, deleteUserError.message);
            } else {
                console.log(`Success.`);
            }
        }
    } else {
        console.log('No agents found in profiles.');
    }

    // 3. Clean up `agents` table (in case of leftovers or if agents table has non-linked records)
    console.log('Cleaning up AGENTS table...');
    const { error: agentsTableError, count: agentsCount } = await supabase
        .from('agents')
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (agentsTableError) {
        console.error('Error cleaning agents table:', agentsTableError);
    } else {
        console.log(`Deleted ${agentsCount} records from agents table.`);
    }

    console.log('--- CLEANUP COMPLETE ---');
}

main().catch(console.error);
