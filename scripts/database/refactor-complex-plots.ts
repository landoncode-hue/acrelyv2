
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const SEPARATORS = /[\/&+,]/; // Slash, Ampersand, Plus, Comma

async function refactor() {
    console.log('🚀 Starting Complex Plot Refactoring...');

    // Fetch all estates
    const { data: estates } = await supabase.from('estates').select('id, name');
    if (!estates) throw new Error('No estates found');

    for (const estate of estates) {
        console.log(`\nProcessing Estate: ${estate.name}`);
        const { data: plots } = await supabase.from('plots').select('*').eq('estate_id', estate.id);

        if (!plots || plots.length === 0) continue;

        // 1. Find Super Plots
        const clusters = plots.filter(p => SEPARATORS.test(p.plot_number));
        console.log(`   Found ${clusters.length} clusters to explode.`);

        for (const cluster of clusters) {
            console.log(`   💥 Exploding: ${cluster.plot_number}`);

            // Clean and split
            // Remove "PLOT-" prefix for parsing
            const clean = cluster.plot_number.replace(/^PLOT-|UNASSIGNED-/i, '');
            // Split
            const parts = clean.split(SEPARATORS).map(s => s.trim()).filter(Boolean);

            console.log(`      -> Parts: ${JSON.stringify(parts)}`);
            if (parts.length < 2) {
                console.log(`      ⚠️  Skipping: Couldn't split properly.`);
                continue;
            }

            // Get allocations for this cluster
            const { data: allocations } = await supabase.from('allocations').select('*').eq('plot_id', cluster.id);
            if (!allocations || allocations.length === 0) {
                console.log(`      ⚠️  No allocations provided. Just deleting/renaming? Safe to delete and recreate empties.`);
            }

            // Process each part
            for (const part of parts) {
                const newNum = `PLOT-${part.padStart(3, '0')}`;

                // 1. Create/Find Plot
                let targetPlotId;
                const { data: existing } = await supabase.from('plots')
                    .select('id')
                    .eq('estate_id', estate.id)
                    .eq('plot_number', newNum)
                    .single();

                if (existing) {
                    targetPlotId = existing.id;
                    console.log(`      ✅ Found existing target: ${newNum}`);
                } else {
                    const { data: newPlot, error: createErr } = await supabase.from('plots').insert({
                        estate_id: estate.id,
                        plot_number: newNum,
                        status: 'sold', // Assume sold if cluster was occupied
                        dimensions: cluster.dimensions,
                        price: cluster.price // Copy price?
                    }).select('id').single();

                    if (createErr) {
                        console.error(`      ❌ Error creating ${newNum}: ${createErr.message}`);
                        continue;
                    }
                    targetPlotId = newPlot.id;
                    console.log(`      ✨ Created target: ${newNum}`);
                }

                // 2. Clone Allocations (if any)
                if (allocations) {
                    for (const alloc of allocations) {
                        try {
                            // Check uniqueness
                            const { data: dupAlloc } = await supabase.from('allocations').select('id').eq('plot_id', targetPlotId).eq('customer_id', alloc.customer_id).single();
                            let targetAllocId = dupAlloc?.id;

                            if (!targetAllocId) {
                                const { data: newAlloc, error: allocErr } = await supabase.from('allocations').insert({
                                    customer_id: alloc.customer_id,
                                    estate_id: estate.id,
                                    plot_id: targetPlotId,
                                    status: alloc.status,
                                    allocation_date: alloc.allocation_date
                                }).select('id').single();

                                if (allocErr) throw allocErr;
                                targetAllocId = newAlloc.id;
                            }

                            // 3. Clone Payments (split amount)
                            const { data: payments } = await supabase.from('payments').select('*').eq('allocation_id', alloc.id);
                            if (payments) {
                                for (const pay of payments) {
                                    // Split amount
                                    const splitAmount = Math.floor(pay.amount / parts.length);

                                    // Check if exists
                                    const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true })
                                        .eq('allocation_id', targetAllocId)
                                        .eq('transaction_reference', `${pay.transaction_reference}-SPLIT-${part}`);

                                    if (count === 0) {
                                        await supabase.from('payments').insert({
                                            allocation_id: targetAllocId,
                                            amount: splitAmount,
                                            payment_date: pay.payment_date,
                                            payment_method: pay.payment_method,
                                            status: pay.status,
                                            transaction_reference: `${pay.transaction_reference}-SPLIT-${part}`
                                        });
                                    }
                                }
                            }

                        } catch (e: any) {
                            console.error(`      ❌ Allocation error for ${newNum}: ${e.message}`);
                        }
                    }
                }
            }

            // Delete original cluster
            await supabase.from('plots').delete().eq('id', cluster.id);
            console.log(`      🗑️  Deleted cluster: ${cluster.plot_number}`);
        }

        // 2. Process Half Plots
        const halfPlots = plots.filter(p => !SEPARATORS.test(p.plot_number) && /[0-9]+[AB]$/i.test(p.plot_number.replace('PLOT-', '')));
        console.log(`   Found ${halfPlots.length} half plots to update flags.`);

        for (const hp of halfPlots) {
            // Extract suffix
            const clean = hp.plot_number.replace('PLOT-', '');
            const match = clean.match(/^(\d+)([AB])$/i);
            if (match) {
                const num = match[1];
                const suffix = match[2].toUpperCase();

                // Do we rename to "PLOT-XXX"? Or "PLOT-XXXA"?
                // If we rename to "PLOT-XXX" (e.g. 4), we collide with the other half (4B -> 4, 4A -> 4).
                // Unless DB supports duplicates.
                // Or we keep name "PLOT-004A" but set is_half_plot=true.
                // Task says "make half plots native". Native usually means "Plot 4, Designation A".
                // If we update plot_number to "4", we likely get unique constraint error if "4A" and "4B" exist.
                // Let's try to set flags ONLY first. If that works, good.
                // If user wants them to share the same Plot ID... that's "Shared Ownership" or "Sub-plots".
                // The implementation plan says: "ensures the user's request for native handling...".
                // User said: "individual plots carrying the same customer data".

                // Let's set the flags on the existing record.
                const { error: updateErr } = await supabase.from('plots').update({
                    // plot_number: `PLOT-${num.padStart(3, '0')}`, // RISKY without dedup logic
                    is_half_plot: true,
                    half_plot_designation: suffix
                }).eq('id', hp.id);

                if (updateErr) console.error(`      ❌ Error updating ${hp.plot_number}: ${updateErr.message}`);
                else console.log(`      ✅ Updated flags for ${hp.plot_number} (Half Plot ${suffix})`);
            }
        }
    }

    console.log('\nDone.');
}

refactor();
