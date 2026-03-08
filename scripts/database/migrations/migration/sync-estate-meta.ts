import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log('Fetching estates...');
    const { data: estates, error } = await supabase.from('estates').select('id, name');

    if (error) {
        console.error('Error fetching estates:', error);
        return;
    }

    console.log(`Found ${estates.length} estates. Syncing counts...`);

    for (const estate of estates) {
        // Count total
        const { count: total } = await supabase
            .from('plots')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', estate.id);

        // Count available
        const { count: available } = await supabase
            .from('plots')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', estate.id)
            .eq('status', 'available');

        // Count occupied (sold, reserved, allocated - basically anything not available)
        // Or simpler: total - available
        const occupied = (total || 0) - (available || 0);

        console.log(`Estate: ${estate.name} -> Total: ${total}, Available: ${available}, Occupied: ${occupied}`);

        const { error: updateError } = await supabase
            .from('estates')
            .update({
                total_plots: total,
                available_plots: available,
                occupied_plots: occupied
            })
            .eq('id', estate.id);

        if (updateError) {
            console.error(`  Failed to update ${estate.name}:`, updateError);
        } else {
            console.log(`  Updated ${estate.name}`);
        }
    }
    console.log('Sync complete.');
}

main();
