
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAndFixDuplicateEstates() {
    console.log("🕵️ Checking for Duplicate Estates after final import...");

    // Get all estates
    const { data: estates, error } = await supabase.from('estates').select('id, name, created_at, location, price, description').order('name');

    if (error) {
        console.error("Error fetching estates:", error.message);
        return;
    }

    if (!estates) return;

    // Group by Normalized Name (case insensitive, trim whitespace)
    const grouped: Record<string, typeof estates> = {};

    estates.forEach(e => {
        const norm = e.name.trim().toLowerCase();
        // Handle "New Era Estate" vs "New Era of Wealth Estate" heuristics?
        // User's screenshot showed: "Ehi Green Park Estate", "New Era of Wealth Estate", "Oduwa Housing Estate". 
        // My import created "New Era Estate".
        // If "New Era of Wealth Estate" exists (from Seed or previous manual creation), and "New Era Estate" (from Import), they are dupes.

        let key = norm;
        if (key.includes('new era')) key = 'new era'; // Broad grouping for New Era

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(e);
    });

    for (const [key, group] of Object.entries(grouped)) {
        if (group.length > 1) {
            console.log(`⚠️  Found ${group.length} potential duplicates for "${key}":`);
            group.forEach(e => console.log(`   - ${e.name} (${e.id}) Created: ${e.created_at}`));

            // Strategy: 
            // 1. Identify "Canonical" estate. 
            //    - Prefer the one with MORE allocations/plots? 
            //    - Or prefer the one with the "Better" name (e.g. "New Era of Wealth Estate" vs "New Era Estate"?)

            // Let's count allocations for each.
            const stats = await Promise.all(group.map(async (e) => {
                const { count: plots } = await supabase.from('plots').select('*', { count: 'exact', head: true }).eq('estate_id', e.id);
                const { count: allocs } = await supabase.from('allocations').select('*', { count: 'exact', head: true }).eq('estate_id', e.id);
                return { ...e, plots: plots || 0, allocs: allocs || 0 };
            }));

            // Sort by Allocation Count DESC
            stats.sort((a, b) => b.allocs - a.allocs);

            const winner = stats[0];
            const losers = stats.slice(1);

            console.log(`   🏆 Winner: ${winner.name} (${winner.id}) with ${winner.allocs} allocations.`);

            // Merge Losers into Winner?
            for (const loser of losers) {
                console.log(`   🗑️  Merging/Deleting Duplicate: ${loser.name} (${loser.id})`);

                // If loser has allocations, Move them?
                if (loser.allocs > 0) {
                    console.log(`      Moving allocations from ${loser.id} to ${winner.id}...`);
                    await supabase.from('allocations').update({ estate_id: winner.id }).eq('estate_id', loser.id);
                }

                // If loser has plots, Move them? (Watch out for collision on number)
                if (loser.plots > 0) {
                    console.log(`      Moving plots from ${loser.id} to ${winner.id}...`);
                    // This might fail if plot numbers clash. RLS/Constraints might block.
                    // Try moving. If fail, we might need to delete if they are indeed duplicates of existing ones.

                    // If we moved allocations, the plots associated with them effectively need to move too... 
                    // BUT allocations link to PLOTS, not just Estate.
                    // The plots link to Estate.
                    // So we must move Plots. 

                    // Safest: Iterate plots and move one by one, if update fails (collision), check if target plot exists.
                    // If target plot exists, re-link allocation to target plot, then delete source plot.

                    const { data: sourcePlots } = await supabase.from('plots').select('id, plot_number').eq('estate_id', loser.id);
                    if (sourcePlots) {
                        for (const p of sourcePlots) {
                            const { error: moveErr } = await supabase.from('plots').update({ estate_id: winner.id }).eq('id', p.id);
                            if (moveErr) {
                                // Collision likely. Duplicate plot number in Target.
                                // Find Target Plot
                                const { data: targetP } = await supabase.from('plots').select('id').eq('estate_id', winner.id).eq('plot_number', p.plot_number).single();
                                if (targetP) {
                                    // Re-link allocations from Source Plot to Target Plot
                                    await supabase.from('allocations').update({ plot_id: targetP.id }).eq('plot_id', p.id);
                                    // Delete Source Plot
                                    await supabase.from('plots').delete().eq('id', p.id);
                                }
                            }
                        }
                    }
                }

                // Delete the Estate
                const { error: delErr } = await supabase.from('estates').delete().eq('id', loser.id);
                if (delErr) console.error(`      Failed to delete estate ${loser.id}: ${delErr.message}`);
                else console.log(`      ✅ Deleted duplicate estate.`);
            }
        }
    }
    console.log("🏁 Duplicate check complete.");
}

checkAndFixDuplicateEstates();
