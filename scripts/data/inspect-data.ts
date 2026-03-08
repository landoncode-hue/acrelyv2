
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function inspectData() {
    console.log("--- Inspecting Estates ---");
    const { data: estates } = await supabase.from('estates').select('*');
    if (estates?.length) {
        estates.forEach(e => {
            console.log(`Estate: ${e.name} (ID: ${e.id})`);
            console.log(`  Total: ${e.total_plots}, Available: ${e.available_plots}, Sold: ${e.sold_plots}`);
        });
    } else {
        console.log("No estates found.");
    }

    console.log("\n--- Inspecting Payments ---");
    const { count: paymentCount, data: samplePayments } = await supabase.from('payments').select('*', { count: 'exact' }).limit(5);
    console.log(`Total Payments Count: ${paymentCount}`);
    if (samplePayments?.length) {
        console.log("Sample Payment Dates:", samplePayments.map(p => ({ id: p.id, date: p.payment_date, created_at: p.created_at })));
    }

    console.log("\n--- Inspecting 2001 Dates in Customers ---");
    // Check for weird dates
    const { data: weirdDates } = await supabase.from('customers').select('id, full_name, created_at').filter('created_at', 'lt', '2024-01-01').limit(10);
    if (weirdDates?.length) {
        console.log("Found customers with old dates:", weirdDates);
    } else {
        console.log("No customers found with created_at < 2024");
    }

    console.log("\n--- Inspecting Unassigned Plots ---");
    const { count: plotCount } = await supabase.from('plots').select('*', { count: 'exact', head: true });
    const { count: unassignedCount } = await supabase.from('plots').select('*', { count: 'exact', head: true }).eq('status', 'available');
    console.log(`Total Plots: ${plotCount}`);
    console.log(`Available (Unassigned) Plots: ${unassignedCount}`);
}

inspectData();
