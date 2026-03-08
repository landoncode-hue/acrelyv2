import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const TARGET_ESTATE_ID = 'eba12c33-3d1a-4cac-977f-af01c06ff827'; // New Era Of Wealth Estate
const SOURCE_ESTATE_ID = 'cefbd255-b60a-4fbd-9a97-9a7b4521367c'; // NEW ERA ESTATE

async function main() {
    console.log(`Merging plots from ${SOURCE_ESTATE_ID} to ${TARGET_ESTATE_ID}...`);

    // 1. Get all plots from Source
    const { data: sourcePlots, error: sourceError } = await supabase
        .from('plots')
        .select('*')
        .eq('estate_id', SOURCE_ESTATE_ID);

    if (sourceError || !sourcePlots) {
        console.error('Error fetching source plots:', sourceError);
        return;
    }

    console.log(`Found ${sourcePlots.length} plots in Source.`);

    // 2. Iterate and Move/Merge
    for (const srcPlot of sourcePlots) {
        // Check if plot exists in Target
        const { data: targetPlots } = await supabase
            .from('plots')
            .select('*')
            .eq('estate_id', TARGET_ESTATE_ID)
            .ilike('plot_number', srcPlot.plot_number); // Case-insensitive match

        if (targetPlots && targetPlots.length > 0) {
            // CONFLICT: Target plot exists.
            const targetPlot = targetPlots[0];
            console.log(`  Conflict: Plot ${srcPlot.plot_number} exists in Target (ID: ${targetPlot.id}). Merging...`);

            // If source plot is occupied (sold/allocated) and target is available, overwrite target status
            // The Legacy source plot has the "truth" about occupancy.
            // We need to move Allocations from Source Plot -> Target Plot

            // Re-link allocations
            const { error: allocError } = await supabase
                .from('allocations')
                .update({ plot_id: targetPlot.id, estate_id: TARGET_ESTATE_ID })
                .eq('plot_id', srcPlot.id);

            if (allocError) {
                console.error(`    Failed to move allocations for ${srcPlot.plot_number}:`, allocError);
                continue;
            }

            // Update Target Plot status if Source was occupied
            if (srcPlot.status !== 'available') {
                await supabase.from('plots').update({ status: srcPlot.status }).eq('id', targetPlot.id);
            }

            // Delete Source Plot
            await supabase.from('plots').delete().eq('id', srcPlot.id);
            console.log(`    Merged and deleted source plot ${srcPlot.plot_number}.`);

        } else {
            // NO CONFLICT: Just move the plot
            console.log(`  Moving Plot ${srcPlot.plot_number} to Target...`);
            const { error: moveError } = await supabase
                .from('plots')
                .update({ estate_id: TARGET_ESTATE_ID })
                .eq('id', srcPlot.id);

            if (moveError) {
                console.error(`    Failed to move plot ${srcPlot.plot_number}:`, moveError);
            }

            // Also update allocations linked to this plot to point to new estate_id
            await supabase
                .from('allocations')
                .update({ estate_id: TARGET_ESTATE_ID })
                .eq('plot_id', srcPlot.id);
        }
    }

    console.log('Merge complete. You may want to delete the source estate manually or via script if empty.');
}

main();
