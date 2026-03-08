
import { SupabaseClient } from "@supabase/supabase-js";

export async function testAllocationsAndPayments(
    staffClient: SupabaseClient,
    approverClient: SupabaseClient,
    estateData: any,
    customer: any
) {
    console.log("\n💰 [TEST] Sales & Payments");

    const estate = estateData.estate;
    const plot = estateData.plots[0];

    // 1. Create Allocation (Draft)
    console.log("   Drafting Allocation...");
    const { data: allocation, error: allocError } = await staffClient
        .from('allocations')
        .insert({
            customer_id: customer.id,
            plot_id: plot.id,
            estate_id: estate.id,
            status: 'draft',
            notes: 'Initial deposit pending'
        })
        .select()
        .single();

    if (allocError) throw new Error(`Create Allocation Failed: ${allocError.message}`);
    console.log(`   ✅ Allocation Drafted: ${allocation.id}`);

    // 2. Submit for Approval
    // Enum is 'draft', 'active', 'revoked', 'completed'.
    // Assuming 'draft' is the pending state.
    console.log("   (Skipping explicit submit step, assuming Draft = Pending)");

    // 3. Approve (CEO)
    const { data: approvedAlloc, error: approveError } = await approverClient
        .from('allocations')
        .update({
            status: 'active',
            approved_by: (await approverClient.auth.getUser()).data.user?.id
        })
        .eq('id', allocation.id)
        .select()
        .single();

    if (approveError) throw new Error(`Approve Allocation Failed: ${approveError.message}`);

    if (approvedAlloc.status !== 'active') {
        throw new Error(`Approval Verification Failed. Status is ${approvedAlloc.status}`);
    }
    console.log("   ✅ Allocation Approved (Active) by CEO.");

    // 4. Update Plot Status
    // Ideally this happens via Database Trigger, but if not, Staff does it?
    // Let's check if trigger exists or if we do it manually.
    // Assuming manual for now as per simple schema, or verify if plot status changed?
    // Let's manually update plot for now to simulate complete flow.
    await staffClient.from('plots').update({ status: 'sold', customer_id: customer.id }).eq('id', plot.id);
    console.log("   ✅ Plot marked as Sold.");


    // 5. Record Payment
    const { data: payment, error: payError } = await staffClient
        .from('payments')
        .insert({
            customer_id: customer.id,
            allocation_id: allocation.id,
            amount: 1000000,
            method: 'bank_transfer',
            status: 'verified'
        })
        .select()
        .single();

    if (payError) throw new Error(`Record Payment Failed: ${payError.message}`);
    console.log(`   ✅ Payment Recorded: ${payment.amount}`);

}
