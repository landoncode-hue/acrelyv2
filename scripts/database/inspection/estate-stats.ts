
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkStats() {
    // Get Estates
    const { data: estates } = await supabase.from('estates').select('id, name');

    console.log('--- Allocation Counts per Estate ---');
    for (const e of estates || []) {
        const { count } = await supabase.from('allocations')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', e.id);

        // Also check plots status
        const { count: assignedPlots } = await supabase.from('plots')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', e.id)
            .neq('status', 'available');

        console.log(`${e.name}: ${count} allocations, ${assignedPlots} assigned plots`);
    }
}

checkStats();
