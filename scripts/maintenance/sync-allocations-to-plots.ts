
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

/**
 * SYNC SCRIPT:
 * 1. Find all ALLOCATIONS.
 * 2. For each allocation, ensure the linked PLOT has status = 'sold' (or allocated).
 * 3. Re-run Estate Count sync.
 */
async function syncAllocations() {
    console.log("🚀 Starting Allocation <-> Plot Sync...");

    // 1. Fetch all allocations with plot_id
    const { data: allocations, error } = await supabase
        .from('allocations')
        .select('id, plot_id, status');

    if (error || !allocations) {
        console.error("Failed to fetch allocations", error);
        return;
    }

    console.log(`Found ${allocations.length} allocations.`);
    const plotIdsToUpdate = allocations.filter(a => a.plot_id).map(a => a.plot_id);

    // 2. Update Plots
    // We can do a bulk update or per-item. Bulk is better but let's be safe and do batches or just simple 'in' query.
    // If an allocation exists, the plot is effectively SOLD/ALLOCATED.
    // We'll set status to 'sold' for simplicity (or whatever the standard is). 
    // Wait, if allocation status is 'active', plot is sold.

    if (plotIdsToUpdate.length > 0) {
        console.log(`Updating ${plotIdsToUpdate.length} plots to status='sold'...`);
        const { error: updateError } = await supabase
            .from('plots')
            .update({ status: 'sold' })
            .in('id', plotIdsToUpdate)
            .neq('status', 'sold'); // Only update if not already sold (optimization)

        if (updateError) console.error("Error updating plots:", updateError);
        else console.log("Plots synced.");
    }

    // 3. Re-calculate Estate Counts (Re-using logic from fix-system-data)
    console.log("\n--- Re-syncing Estate Counts ---");
    const { data: estates } = await supabase.from('estates').select('id, name');
    if (estates) {
        for (const estate of estates) {
            const { count: total } = await supabase.from('plots').select('*', { count: 'exact', head: true }).eq('estate_id', estate.id);

            // Sold/Allocated/Occupied (occupied_plots column)
            const { count: occupied } = await supabase
                .from('plots')
                .select('*', { count: 'exact', head: true })
                .eq('estate_id', estate.id)
                .neq('status', 'available');

            const { count: available } = await supabase
                .from('plots')
                .select('*', { count: 'exact', head: true })
                .eq('estate_id', estate.id)
                .eq('status', 'available');

            console.log(`Updating ${estate.name}: Occupied/Sold=${occupied}, Avail=${available}`);
            await supabase.from('estates').update({
                total_plots: total,
                occupied_plots: occupied,
                sold_plots: occupied, // Update both to be safe as we transition
                available_plots: available
            }).eq('id', estate.id);
        }
    }

    console.log("✅ Sync completed.");
}

syncAllocations();
