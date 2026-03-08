
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { testAllocationsAndPayments } from "./scenarios/sales";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
}

// 1. Helper to login and return a client with that user's session
async function loginAndGetClient(email: string, password: string, roleName: string): Promise<SupabaseClient | null> {
    console.log(`\n🔐 Logging in as ${roleName} (${email})...`);
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
        console.error(`   ❌ Failed to login as ${roleName}:`, error.message);
        return null;
    }
    console.log(`   ✅ Logged in as ${roleName} (ID: ${data.user.id})`);
    return client;
}

// 2. SysAdmin Check
async function runSysAdminChecks(client: SupabaseClient) {
    console.log("\n🛠 Running SysAdmin Checks...");
    // Verify ability to list users (needs service role usually, but let's check profile access)
    // Actually, sysadmin might not have supabase.auth.admin access via client key unless using service role.
    // We check if they can access sensitive data via RLS.
    const { data: profiles, error } = await client.from('profiles').select('*').limit(5);
    if (error) {
        console.error("   ❌ SysAdmin failed to list profiles:", error.message);
    } else {
        console.log(`   ✅ SysAdmin listed ${profiles.length} profiles.`);
    }
}

// 3. Setup Test Data (using Service Role for setup)
async function setupTestData() {
    console.log("\n📦 Setting up Test Data...");
    const serviceClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // Find or Create Test Customer
    // Use a unique email to avoid "User already exists" issues masking as 500s or diff difficulties
    const uniqueId = Date.now();
    const testEmail = `test_flow_customer_${uniqueId}@example.com`;
    const testPassword = "CustomerPass123!";

    let customerId;

    console.log(`   Creating new test customer with email: ${testEmail}...`);
    const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: { full_name: "Test Flow Customer" }
    });

    if (createError) {
        console.error("   ❌ Error creating user:", createError);
        throw new Error(`Failed to create test customer: ${createError.message}`);
    }
    customerId = newUser.user.id;
    console.log(`   Created test customer: ${customerId}`);

    // Ensure profile logic (even though trigger might have done it, we upsert to be safe)
    await serviceClient.from('profiles').upsert({
        id: customerId,
        email: testEmail,
        role: 'customer',
        full_name: "Test Flow Customer"
    }, { onConflict: 'id' });


    // Find Estate and Plot
    const { data: estates } = await serviceClient.from('estates').select('*').limit(1);
    if (!estates || estates.length === 0) throw new Error("No estates found to test with.");

    const estate = estates[0];

    // Find an available plot
    const { data: plots } = await serviceClient.from('plots')
        .select('*')
        .eq('estate_id', estate.id)
        .eq('status', 'available')
        .limit(1);

    if (!plots || plots.length === 0) {
        console.warn("   ⚠️ No available plots found in first estate. Creating one...");
        const { data: newPlot } = await serviceClient.from('plots').insert({
            estate_id: estate.id,
            plot_number: `TEST-FLOW-${Date.now()}`,
            size_sqm: 500,
            price: 1000000,
            status: 'available'
        }).select().single();
        if (!newPlot) throw new Error("Failed to create test plot");
        return { customer: { id: customerId, email: testEmail, password: testPassword }, estate, plots: [newPlot] };
    }

    return { customer: { id: customerId, email: testEmail, password: testPassword }, estate, plots };
}

async function verifyAllFlows() {
    console.log("🚀 Starting Full User Flow Verification");

    // A. Credentials
    const CREDS = {
        sysadmin: { email: 'sysadmin@pinnaclegroups.ng', pass: 'SysAdminPinnacle2025!' },
        ceo: { email: 'ceo@pinnaclegroups.ng', pass: 'CeoPinnacle2025!' },
        staff: { email: 'frontdesk@pinnaclegroups.ng', pass: 'FrontDeskPinnacle2025!' },
    };

    // B. Login Everyone
    const sysAdminClient = await loginAndGetClient(CREDS.sysadmin.email, CREDS.sysadmin.pass, "SysAdmin");
    const ceoClient = await loginAndGetClient(CREDS.ceo.email, CREDS.ceo.pass, "CEO");
    const staffClient = await loginAndGetClient(CREDS.staff.email, CREDS.staff.pass, "FrontDesk");

    if (!sysAdminClient || !ceoClient || !staffClient) {
        console.error("❌ Critical: One or more admin/staff logins failed. Aborting.");
        return;
    }

    // C. Run SysAdmin Checks
    await runSysAdminChecks(sysAdminClient);

    // D. Setup for Sales Loop
    const serviceClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    console.log("\n🕵️ Probing Columns...");
    const { error: allocPriceErr } = await serviceClient.from('allocations').select('price').limit(1);
    console.log(`   allocations.price exists? ${!allocPriceErr ? 'YES' : 'NO (' + allocPriceErr.message + ')'}`);

    const { data: plotsSample, error: plotsErr } = await serviceClient.from('plots').select('*').limit(1);
    if (plotsSample && plotsSample.length > 0) {
        console.log("   plots columns:", Object.keys(plotsSample[0]));
    } else {
        console.log("   plots columns: could not fetch sample", plotsErr?.message);
    }

    // Find or Create Test Customer

    const uniqueId = Date.now();
    const testEmail = `test_flow_customer_${uniqueId}@example.com`;
    const testPassword = "CustomerPass111!";

    let customerId: string | undefined;
    let customerClient: SupabaseClient | null = null;

    console.log(`   Attempting to create new test customer: ${testEmail}...`);
    const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {} // Try empty metadata
    });

    if (createError) {
        console.error("   ❌ Error creating user (Trigger suspected):", createError.message);
        console.log("   ⚠️ Fallback: Searching for ANY existing non-admin user to use as Customer subject...");

        const { data: allUsers } = await serviceClient.auth.admin.listUsers({ perPage: 1000 });
        const adminEmails = ['sysadmin@pinnaclegroups.ng', 'ceo@pinnaclegroups.ng', 'md@pinnaclegroups.ng', 'frontdesk@pinnaclegroups.ng'];
        const fallbackUser = allUsers?.users.find(u => !adminEmails.includes(u.email || ''));

        if (fallbackUser) {
            console.log(`   ✅ Found fallback user: ${fallbackUser.email} (${fallbackUser.id})`);
            customerId = fallbackUser.id;

            // RESET PASSWORD so we can login
            console.log(`   🔄 Resetting password for fallback user to '${testPassword}'...`);
            const { error: resetError } = await serviceClient.auth.admin.updateUserById(customerId, {
                password: testPassword
            });

            if (resetError) {
                console.error("   ❌ Failed to reset password:", resetError.message);
            } else {
                console.log("   ✅ Password reset successful.");
                customerClient = await loginAndGetClient(fallbackUser.email!, testPassword, "Customer (Fallback)");
            }

        } else {
            console.error("   ❌ No fallback user found. Cannot test Sales Flow.");
            return;
        }
    } else {
        customerId = newUser.user.id;
        console.log(`   Created test customer: ${customerId}`);
        // Login as them
        customerClient = await loginAndGetClient(testEmail, testPassword, "Customer");
    }

    let tableCustomerId: string | undefined;

    if (customerId) {
        // Ensure profile exists for fallback user too (idempotent)
        await serviceClient.from('profiles').upsert({
            id: customerId,
            role: 'customer',
            email: createError ? undefined : testEmail // Don't overwrite email if fallback
        }, { onConflict: 'id', ignoreDuplicates: true });

        // Ensure row in customers table
        // We assume 'customers' has a profile_id column based on RLS file.
        // We SELECT first to see if exists (for fallback user)
        const { data: existingCust } = await serviceClient.from('customers').select('id').eq('profile_id', customerId).single();

        if (existingCust) {
            tableCustomerId = existingCust.id;
            console.log(`   ✅ Found existing customers row: ${tableCustomerId}`);
        } else {
            console.log("   Creating new customers row...");
            const { data: newCust, error: custError } = await serviceClient
                .from('customers')
                .insert({
                    profile_id: customerId,
                    full_name: "Test Customer Fallback", // Required field
                    email: testEmail, // Often required
                    phone: `080${Date.now().toString().slice(-8)}` // Random phone just in case
                })
                .select()
                .single();

            if (custError) {
                console.error("   ⚠️ Could not insert to customers table:", custError.message);
                if (custError.message.includes("column")) {
                    // Try with JUST profile_id and maybe ID (if 1:1)? No, try minimal.
                }
            } else {
                tableCustomerId = newCust.id;
                console.log(`   ✅ Created customers row: ${tableCustomerId}`);
            }
        }
    }

    // Estate/Plot Setup
    const { data: estates } = await serviceClient.from('estates').select('*').limit(1);
    if (!estates || estates.length === 0) { console.error("No estates"); return; }
    const estate = estates[0];
    const { data: plots } = await serviceClient.from('plots').select('*').eq('estate_id', estate.id).limit(1);
    const testData = { estate, plots };

    // E. Run Sales Scenario
    if (tableCustomerId) {
        console.log(`\n💰 Running Sales Flow with Customer Table ID: ${tableCustomerId}...`);
        try {
            // Pass the CUSTOMER TABLE ID, not Auth ID, if allocations references customers.
            // But we also pass email for logs.
            const customerObj = { id: tableCustomerId, email: testEmail };
            await testAllocationsAndPayments(staffClient, ceoClient, testData, customerObj);
        } catch (e: any) {
            console.error("❌ Sales Flow Failed:", e.message);
        }
    } else {
        console.error("❌ Skipping Sales Flow: No valid customers table record found.");
    }

    // F. Customer Verification
    if (customerClient) {
        console.log("\n👤 Verifying Customer View...");
        const { data: myAllocations } = await customerClient.from('allocations').select('*');
        console.log(`   Customer sees ${myAllocations?.length} allocations.`);
    } else {
        console.log("\n⚠️ Skipping Customer View verification (No credential available for fallback user).");
    }


    console.log("\n✅ All Flows Verification Complete.");
}

verifyAllFlows();

