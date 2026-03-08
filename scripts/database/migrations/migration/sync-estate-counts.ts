
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncEstateCounts() {
    console.log('🔄 Syncing Estate Counts...');

    // 1. Fetch all estates
    const { data: estates, error: estateError } = await supabase
        .from('estates')
        .select('id, name, total_plots');

    if (estateError || !estates) {
        console.error('Error fetching estates:', estateError);
        return;
    }

    console.log(`Found ${estates.length} estates.`);

    for (const estate of estates) {
        // 2. Count allocations for this estate
        const { count, error: countError } = await supabase
            .from('allocations')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', estate.id);

        if (countError) {
            console.error(`Error counting allocations for ${estate.name}:`, countError);
            continue;
        }

        const occupied = count || 0;
        const total = estate.total_plots || 0;
        const available = Math.max(0, total - occupied);

        // 3. Update estate
        const { error: updateError } = await supabase
            .from('estates')
            .update({
                occupied_plots: occupied,
                available_plots: available
            })
            .eq('id', estate.id);

        if (updateError) {
            console.error(`Failed to update ${estate.name}:`, updateError);
        } else {
            console.log(`✅ ${estate.name}: ${occupied}/${total} occupied (${available} available)`);
        }
    }

    console.log('✨ Sync Complete!');
}

syncEstateCounts();
