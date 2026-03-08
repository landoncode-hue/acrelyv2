
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function resetPlots() {
    console.log('🚧 Starting Plot Status Reset...');

    // Fetch all plots that are not available
    const { data: plots, error } = await supabase
        .from('plots')
        .select('id, status')
        .neq('status', 'available');

    if (error) {
        console.error('Error fetching plots:', error);
        return;
    }

    console.log(`Found ${plots.length} plots to reset.`);

    let successCount = 0;
    let failCount = 0;

    for (const plot of plots) {
        // Update individually to isolate trigger issues or bypass stack depth if caused by bulk cascade
        const { error: updateError } = await supabase
            .from('plots')
            .update({
                status: 'available',
                customer_id: null
            })
            .eq('id', plot.id);

        if (updateError) {
            console.error(`Failed to reset plot ${plot.id}:`, updateError.message);
            failCount++;
        } else {
            successCount++;
            process.stdout.write('.'); // Progress indicator
        }
    }

    console.log('\n✅ Plot Reset Complete!');
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
}

resetPlots();
