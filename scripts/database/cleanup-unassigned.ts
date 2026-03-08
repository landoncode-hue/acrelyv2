
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function cleanup() {
    console.log('🧹 Cleaning up UNASSIGNED plots...');

    // Find UNASSIGNED
    const { data: unassigned, error } = await supabase.from('plots')
        .select('id, plot_number, estate_id, status')
        .ilike('plot_number', 'UNASSIGNED%');

    if (error) {
        console.error('Error fetching unassigned:', error);
        return;
    }

    if (!unassigned || unassigned.length === 0) {
        console.log('🎉 No unassigned plots found.');
        return;
    }

    console.log(`Found ${unassigned.length} unassigned plots.`);
    let deleted = 0;
    let skipped = 0;

    for (const p of unassigned) {
        // Check allocations
        const { count } = await supabase.from('allocations').select('*', { count: 'exact', head: true }).eq('plot_id', p.id);

        if (count === 0) {
            console.log(`   Deleting empty placeholder: ${p.plot_number}`);
            await supabase.from('plots').delete().eq('id', p.id);
            deleted++;
        } else {
            console.warn(`   ⚠️ Unassigned plot ${p.plot_number} has ${count} allocations! Manual review needed.`);
            skipped++;
        }
    }

    console.log(`Cleanup Done. Deleted: ${deleted}, Skipped: ${skipped}`);
}

cleanup();
