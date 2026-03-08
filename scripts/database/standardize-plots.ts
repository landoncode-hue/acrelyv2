
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/*
const estates = [
    { id: '26f80120-8342-46a6-889d-af6af41fa812', name: 'City of David Estate' },
    // ...
];
*/

async function standardize() {
    console.log('🚀 Starting Plot Standardization for ALL Estates...');

    // Fetch all estates
    const { data: estates } = await supabase.from('estates').select('id, name');
    if (!estates || estates.length === 0) throw new Error('No estates found');

    let totalDeleted = 0;
    let totalRenamed = 0;
    let totalSkipped = 0;

    for (const estate of estates) {
        console.log(`\n-----------------------------------`);
        console.log(`Processing Estate: ${estate.name} (${estate.id})`);

        // 2. Get Plots
        const { data: plots } = await supabase.from('plots').select('*').eq('estate_id', estate.id);
        if (!plots || plots.length === 0) {
            console.log('   No plots found.');
            continue;
        }
        console.log(`   Found ${plots.length} plots.`);

        let deleted = 0;
        let renamed = 0;
        let skipped = 0;

        // Strategy:
        // 1. Identify "Simple" (no prefix) vs "Complex" (PLOT- prefix).
        // 2. If we have "3" and "PLOT-003":
        //    - Check status. Expect "3" is available, "PLOT-003" is sold.
        //    - Delete "3".
        // 3. If we have only "3":
        //    - Rename to "PLOT-003".
        // 4. If we have only "PLOT-003":
        //    - Do nothing.
        // 5. Suffixes: "4B" -> "PLOT-004B".

        // Group by "Normalized Key" for collision detection.
        // Key = <Number> + <Suffix> (e.g. "3", "4B")
        // How to parse "PLOT-003"? -> "3"
        // How to parse "PLOT-004B"? -> "4B"
        // How to parse "4B"? -> "4B"

        const parse = (s: string) => {
            const clean = s.replace(/^PLOT-/i, ''); // Remove prefix
            // Remove leading zeros IF it's just numbers? 
            // "003" -> "3". "04B" -> "4B"?
            // regex: ^0+
            return clean.replace(/^0+/, '');
        };

        const groups = new Map<string, any[]>();

        for (const p of plots) {
            const key = parse(p.plot_number);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(p);
        }

        console.log(`Identified ${groups.size} unique plot keys.`);

        for (const [key, group] of groups) {
            // Sort group: Complex "PLOT-" preferred as primary?
            // Actually, if we have multiple, we expect one "Simple" to be valid-ish (seeded) and one "Complex" (imported).
            // Or duplicate "Simples"?

            const complex = group.find(p => p.plot_number.toUpperCase().startsWith('PLOT-'));
            const simple = group.find(p => !p.plot_number.toUpperCase().startsWith('PLOT-'));

            // Case A: Collision (Both exist) -> Delete Simple (if safe)
            if (complex && simple) {
                if (simple.status === 'available') {
                    // Double check allocations?
                    const { count } = await supabase.from('allocations').select('*', { count: 'exact', head: true }).eq('plot_id', simple.id);
                    if (count === 0) {
                        console.log(`   Merging: Deleting simple duplicate "${simple.plot_number}" (keeping "${complex.plot_number}")`);
                        await supabase.from('plots').delete().eq('id', simple.id);
                        deleted++;
                    } else {
                        console.error(`   ⚠️ CONFLICT: Simple plot "${simple.plot_number}" has allocations but collides with "${complex.plot_number}". Skipping.`);
                        skipped++;
                    }
                } else {
                    console.warn(`   ⚠️ CONFLICT: Simple plot "${simple.plot_number}" is NOT available (${simple.status}). Keeping both for safety.`);
                    skipped++;
                }
            }
            // Case B: Only Simple -> Rename
            else if (simple && !complex) {
                // Rename "3" -> "PLOT-003"
                // Rename "4B" -> "PLOT-004B"

                // Format: PLOT- + 3 digits for number + suffix
                // Extract number and suffix
                const match = simple.plot_number.match(/^(\d+)(.*)$/);
                if (match) {
                    const num = match[1];
                    const suffix = match[2];
                    const newName = `PLOT-${num.padStart(3, '0')}${suffix}`;

                    console.log(`   Renaming: "${simple.plot_number}" -> "${newName}"`);
                    await supabase.from('plots').update({ plot_number: newName }).eq('id', simple.id);
                    renamed++;
                } else {
                    console.log(`   Skipping weird format: "${simple.plot_number}"`);
                    skipped++;
                }
            }
            // Case C: Only Complex -> No action
            else {
                // console.log(`   OK: "${complex.plot_number}"`);
            }
        } // End of group loop

        console.log(`   Estate Summary -> Del: ${deleted}, Ren: ${renamed}, Skip: ${skipped}`);
        totalDeleted += deleted;
        totalRenamed += renamed;
        totalSkipped += skipped;

    } // End of estate loop

    console.log(`\n=== ALL Standardizations Complete ===`);
    console.log(`🗑️  Total Deleted: ${totalDeleted}`);
    console.log(`✏️  Total Renamed: ${totalRenamed}`);
    console.log(`⏭️  Total Skipped: ${totalSkipped}`);
}

standardize();
