
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load envs
dotenv.config();
if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixSystemData() {
    console.log("🚀 Starting System Data Fix (v3 - Robust)...");

    // 1. Fix Estate Counts
    console.log("\n--- Fixing Estate Counts ---");
    const { data: estates, error: estateError } = await supabase.from('estates').select('id, name');

    if (estateError) {
        console.error("Critical: Failed to fetch estates", estateError);
    } else if (estates) {
        for (const estate of estates) {
            // Count total
            const { count: total, error: err1 } = await supabase
                .from('plots')
                .select('*', { count: 'exact', head: true })
                .eq('estate_id', estate.id);

            // Count sold/allocated (Safey: status != available)
            const { count: sold, error: err2 } = await supabase
                .from('plots')
                .select('*', { count: 'exact', head: true })
                .eq('estate_id', estate.id)
                .neq('status', 'available');

            // Count available
            const { count: available, error: err3 } = await supabase
                .from('plots')
                .select('*', { count: 'exact', head: true })
                .eq('estate_id', estate.id)
                .eq('status', 'available');

            if (err1 || err2 || err3) {
                console.error(`Failed to count for ${estate.name}:`, { err1, err2, err3 });
            } else {
                console.log(`Updating ${estate.name}: Total=${total}, Sold=${sold}, Avail=${available}`);
                await supabase.from('estates').update({
                    total_plots: total,
                    sold_plots: sold,
                    available_plots: available
                }).eq('id', estate.id);
            }
        }
    }

    // 2. Fix Dates
    console.log("\n--- Fixing Dates (Customers) ---");

    // Debug: Print first 3 customers to verify what dates look like
    const { data: sample } = await supabase.from('customers').select('id, created_at').limit(3);
    console.log("Sample Customers:", sample);

    // Find customers with old dates (Pre-2010)
    const { data: weirdCustomers, error: weirdError } = await supabase
        .from('customers')
        .select('id, created_at')
        .lt('created_at', '2010-01-01');

    if (weirdError) {
        console.error("Failed to query customers:", weirdError);
    } else if (weirdCustomers && weirdCustomers.length > 0) {
        console.log(`Found ${weirdCustomers.length} customers with invalid dates (pre-2010). Setting to 2024-01-01.`);

        let successCount = 0;
        for (const c of weirdCustomers) {
            const { error } = await supabase
                .from('customers')
                .update({ created_at: '2024-01-01T12:00:00Z' })
                .eq('id', c.id);
            if (error) console.error(`Failed to update ${c.id}:`, error);
            else successCount++;
        }
        console.log(`Updated ${successCount} customers.`);
    } else {
        console.log("No invalid customer dates found (pre-2010).");
    }

    // 3. Fix Payments Dates
    console.log("\n--- Fixing Dates (Payments) ---");
    const { data: weirdPayments, error: payError } = await supabase
        .from('payments')
        .select('id, payment_date')
        .lt('payment_date', '2010-01-01');

    if (weirdPayments && weirdPayments.length > 0) {
        console.log(`Found ${weirdPayments.length} payments with invalid dates (pre-2010). Fixing to 2024-01-01.`);
        for (const p of weirdPayments) {
            await supabase.from('payments').update({ payment_date: '2024-01-01' }).eq('id', p.id);
        }
        console.log("Payments fixed.");
    } else {
        console.log("No invalid payment dates found.");
    }

    // 4. Payment Count Check
    const { count: paymentCount } = await supabase.from('payments').select('*', { count: 'exact', head: true });
    console.log(`\nTotal System Payments: ${paymentCount}`);

    console.log("\n✅ Fix script completed.");
}

fixSystemData();
