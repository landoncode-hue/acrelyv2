
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

async function assignOrphans() {
    console.log("🚀 Starting Orphan Allocation Assignment...");
    const targetEstates = ['The Wealthy Place Estate', 'Hectares of Diamond Estate'];

    for (const name of targetEstates) {
        console.log(`\nProcessing: ${name}`);
        const { data: estate } = await supabase.from('estates').select('id, name').eq('name', name).single();
        if (!estate) continue;

        // 1. Get Orphans
        const { data: orphans } = await supabase
            .from('allocations')
            .select('id')
            .eq('estate_id', estate.id)
            .is('plot_id', null);

        if (!orphans || orphans.length === 0) {
            console.log("No orphans found.");
            continue;
        }
        console.log(`Found ${orphans.length} orphan allocations.`);

        // 2. Get Available Plots
        const { data: plots } = await supabase
            .from('plots')
            .select('id, plot_number')
            .eq('estate_id', estate.id)
            .eq('status', 'available') // Only take truly available ones
            .limit(orphans.length); // Take as many as we need

        if (!plots || plots.length === 0) {
            console.error("CRITICAL: No available plots to assign!");
            continue;
        }
        console.log(`Found ${plots.length} available plots.`);

        if (plots.length < orphans.length) {
            console.warn(`WARNING: Not enough plots! Have ${plots.length}, need ${orphans.length}.`);
        }

        // 3. Assign
        for (let i = 0; i < Math.min(plots.length, orphans.length); i++) {
            const allocation = orphans[i];
            const plot = plots[i];

            console.log(`Assigning Plot ${plot.plot_number} to Allocation ${allocation.id}...`);

            // Link Allocation to Plot
            const { error: e1 } = await supabase
                .from('allocations')
                .update({ plot_id: plot.id })
                .eq('id', allocation.id);

            // Update Plot Status
            const { error: e2 } = await supabase
                .from('plots')
                .update({ status: 'sold' }) // Start with sold
                .eq('id', plot.id);

            if (e1 || e2) console.error("Error assigning:", { e1, e2 });
        }

        // 4. Update Estate Counts immediately
        const soldCount = await supabase.from('plots').select('*', { count: 'exact', head: true }).eq('estate_id', estate.id).neq('status', 'available');
        const availCount = await supabase.from('plots').select('*', { count: 'exact', head: true }).eq('estate_id', estate.id).eq('status', 'available');

        await supabase.from('estates').update({
            sold_plots: soldCount.count,
            occupied_plots: soldCount.count,
            available_plots: availCount.count
        }).eq('id', estate.id);

        console.log(`Updated Estate Counts: Sold=${soldCount.count}, Avail=${availCount.count}`);
    }
    console.log("\n✅ Assignment Complete.");
}

assignOrphans();
