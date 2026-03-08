import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log('Cleaning up empty duplicate estates...');

    // 1. Delete NEW ERA ESTATE (legacy) if empty
    // ID from check-estates output: cefbd255-b60a-4fbd-9a97-9a7b4521367c
    const legacyNewEraId = 'cefbd255-b60a-4fbd-9a97-9a7b4521367c';

    // Safety check: Ensure plot count is 0
    const { count: plotCount } = await supabase
        .from('plots')
        .select('*', { count: 'exact', head: true })
        .eq('estate_id', legacyNewEraId);

    if (plotCount === 0) {
        console.log(`Deleting Legacy New Era Estate (${legacyNewEraId})...`);
        const { error } = await supabase.from('estates').delete().eq('id', legacyNewEraId);
        if (error) console.error('Error deleting:', error);
        else console.log('Deleted successfully.');
    } else {
        console.warn(`Skipping deletion: Legacy New Era has ${plotCount} plots.`);
    }

    // 2. Check for other duplicates via fuzzy name match?
    // For now, let's just create a general "cleanup empty legacy" if needed.
    // The user specifically mentioned duplicates, likely seeing New Era twice.
}

main();
