
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing env vars");
    process.exit(1);
}

// Admin client to setup test users
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createTestUser(email: string, role: 'sysadmin' | 'frontdesk') {
    const password = "password123";

    // 1. Create/Get User
    // Note: admin.createUser auto-confirms email usually
    const { data: { user }, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    let userId = user?.id;

    if (error) {
        // If user already exists, logic to find their ID would be needed, 
        // but for simplicity let's assume clean state or ignore if they exist 
        // and just update their role.
        // Actually, if we can't find them easily without signing in, let's try to sign in first 
        // or list users.
        const { data: users } = await adminClient.auth.admin.listUsers();
        const existing = users.users.find(u => u.email === email);
        if (existing) {
            userId = existing.id;
        } else {
            console.error(`Failed to create user ${email}:`, error.message);
            return null;
        }
    }

    if (!userId) return null;

    // 2. Set Role in Profiles
    // We use adminClient to bypass RLS
    await adminClient.from('profiles').update({
        role: role,
        is_staff: true
    }).eq('id', userId);

    return { email, password, id: userId };
}

async function verify() {
    console.log("Starting Verification for Admin Deletion Rights...");

    // 1. Setup Users
    console.log("Setting up Test Users...");
    const sysAdmin = await createTestUser('test-sysadmin@acrely.com', 'sysadmin');
    const frontDesk = await createTestUser('test-frontdesk@acrely.com', 'frontdesk');

    if (!sysAdmin || !frontDesk) {
        console.error("Failed to setup test users");
        return;
    }

    // 2. Create Dummy Data (Estate, Customer, Plot)
    // We can do this as Service Role for speed
    console.log("creating dummy data...");
    const { data: estate } = await adminClient.from('estates').insert({
        name: 'Delete Verification Estate',
        price: 1000000,
        total_plots: 10
    }).select().single();

    const { data: customer } = await adminClient.from('customers').insert({
        full_name: 'Delete Tester',
        profile_id: frontDesk.id // Link to someone
    }).select().single();

    const { data: plot } = await adminClient.from('plots').insert({
        estate_id: estate.id,
        plot_number: 'DEL-1'
    }).select().single();

    if (!estate || !customer || !plot) {
        console.error("Failed to create dummy foundation data");
        return;
    }

    // 3. Test Case A: Frontdesk (Staff) tries to delete Allocation
    console.log("\n--- Test Case A: Frontdesk Delete (Expect FAILURE) ---");

    // Client for Frontdesk
    const fdClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await fdClient.auth.signInWithPassword({ email: frontDesk.email, password: frontDesk.password });

    // Create Allocation as Frontdesk (Allowed)
    const { data: allocA, error: createErrA } = await fdClient.from('allocations').insert({
        customer_id: customer.id,
        plot_id: plot.id,
        estate_id: estate.id,
        status: 'draft'
    }).select().single();

    if (createErrA) {
        console.error("Frontdesk failed to create allocation (Unexpected):", createErrA.message);
    } else {
        console.log("Allocation created:", allocA.id);

        // Try Delete
        const { error: delErrA } = await fdClient.from('allocations').delete().eq('id', allocA.id);

        if (delErrA) {
            console.log("✅ SUCCESS: Frontdesk delete failed with error:", delErrA.message); // Doesn't actually return error often for RLS, just count 0?
            // Supabase delete returns count. If 0, it means no rows affected (filtered by RLS).
        } else {
            // Check if it's actually gone?
            // RLS silently filters DELETEs if using 'USING'. 'WITH CHECK' is for insert/update.
            // Wait, for DELETE, if no policy matches, it deletes 0 rows.
            // We need to check count.
        }

        // Let's verify existence
        const { data: checkA } = await adminClient.from('allocations').select('id').eq('id', allocA.id);
        if (checkA && checkA.length > 0) {
            console.log("✅ SUCCESS: Allocation still exists (Frontdesk could not delete)");
        } else {
            console.error("❌ FAILURE: Allocation was deleted by Frontdesk!");
        }
    }

    // 4. Test Case B: SysAdmin tries to delete Allocation
    console.log("\n--- Test Case B: SysAdmin Delete (Expect SUCCESS) ---");

    // Client for SysAdmin
    const saClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await saClient.auth.signInWithPassword({ email: sysAdmin.email, password: sysAdmin.password });

    // Use same allocation or create new? Let's use the one generated above if it exists.
    const targetId = allocA?.id;
    if (targetId) {
        const { error: delErrB } = await saClient.from('allocations').delete().eq('id', targetId);
        if (delErrB) console.error("SysAdmin delete error:", delErrB.message);

        // Verify
        const { data: checkB } = await adminClient.from('allocations').select('id').eq('id', targetId);
        if (!checkB || checkB.length === 0) {
            console.log("✅ SUCCESS: Allocation deleted by SysAdmin");
        } else {
            console.error("❌ FAILURE: Allocation still exists after SysAdmin delete");
        }
    }

    // Cleanup
    console.log("\n--- Cleanup ---");
    await adminClient.from('plots').delete().eq('id', plot.id);
    await adminClient.from('customers').delete().eq('id', customer.id);
    await adminClient.from('estates').delete().eq('id', estate.id);
    // Remove users? Maybe keep for future tests or delete.
    // adminClient.auth.admin.deleteUser(sysAdmin.id);
    // adminClient.auth.admin.deleteUser(frontDesk.id);
    console.log("Done.");
}

verify().catch(console.error);
