import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function hardResetPlotFKs() {
    console.log('🔨 Hard resetting plot FKs...');

    // Page through all plots and clear allocations
    let hasMore = true;
    let page = 0;
    while (hasMore) {
        const { data: plots } = await supabase.from('plots').select('id').range(page * 1000, (page + 1) * 1000 - 1);
        if (!plots || plots.length === 0) {
            hasMore = false;
            break;
        }

        const ids = plots.map(p => p.id);
        const { error } = await supabase.from('plots').update({
            half_a_allocation_id: null,
            half_b_allocation_id: null
        }).in('id', ids);

        if (error) console.error(error);
        else console.log(`Cleared ${ids.length} plots...`);

        page++;
    }
    console.log('✅ Done.');
}

hardResetPlotFKs();
