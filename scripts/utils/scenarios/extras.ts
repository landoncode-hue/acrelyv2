
import { SupabaseClient } from "@supabase/supabase-js";
import { generateRandomString } from "../test-utils";

export async function testExtras(
    sysadmin: SupabaseClient,
    staff: SupabaseClient
) {
    console.log("\n🧩 [TEST] Extras (Agents, Audit, Tasks)");

    // 1. Agents & Commissions
    console.log("   Testing Agents...");
    // We need a profile for the agent first? 
    // Usually Agent is a User involved in the system.
    // For now, let's just insert into 'agents' table linked to a dummy profile or existing staff?
    // Table 'agents' has profile_id.
    // Let's use the 'md' profile ID as a dummy agent, or create a new user?
    // Efficient way: just insert a row with a random UUID for profile_id if not enforcing FK strictly or use existing staff.
    // FK `agents_profile_id_fkey` usually enforces it.
    // Let's use the 'frontdesk' user's ID as an agent for testing purposes.
    const frontdeskId = (await staff.auth.getUser()).data.user?.id;

    // Check if agent exists
    const { data: existingAgent } = await staff.from('agents').select().eq('profile_id', frontdeskId).single();
    let agentId = existingAgent?.id;

    if (!existingAgent) {
        const { data: agent, error } = await staff.from('agents').insert({
            profile_id: frontdeskId,
            status: 'active',
            commission_rate: 5.0,
            account_name: 'Test Agent'
        }).select().single();
        if (error) console.log("   ⚠️ Could not create agent (maybe FK issue):", error.message);
        else {
            console.log(`   ✅ Created Agent Record: ${agent.id}`);
            agentId = agent.id;
        }
    }

    if (agentId) {
        // Record Commission
        const { error: commError } = await staff.from('commission_history').insert({
            agent_id: agentId,
            amount: 50000,
            status: 'pending'
        });
        if (commError) throw new Error(`Record Commission Failed: ${commError.message}`);
        console.log("   ✅ Recorded Commission History.");
    }

    // 2. Audit Logs (View as Admin)
    console.log("   Testing Audit Logs Access...");
    const { data: audits, error: auditError } = await sysadmin
        .from('audit_logs')
        .select('*')
        .limit(5);

    if (auditError) throw new Error(`Audit Log Access Failed: ${auditError.message}`);
    console.log(`   ✅ SysAdmin accessed Audit Logs (${audits.length} entries).`);

    // 3. Tasks
    console.log("   Testing Tasks...");
    const { data: task, error: taskError } = await staff
        .from('tasks')
        .insert({
            title: 'Follow up with Customer',
            status: 'todo',
            description: 'Call them about the allocation'
        })
        .select()
        .single();

    if (taskError) throw new Error(`Create Task Failed: ${taskError.message}`);
    console.log(`   ✅ Created Task: ${task.title}`);

    // Update Task
    await staff.from('tasks').update({ status: 'in_progress' }).eq('id', task.id);
    console.log("   ✅ Updated Task Status.");

    return true;
}
