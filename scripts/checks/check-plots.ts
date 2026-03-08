
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPlots() {
    const { data: estates, error: estatesError } = await supabase
        .from('estates')
        .select('id, name, total_plots');

    if (estatesError) {
        console.error('Error fetching estates:', estatesError);
        return;
    }

    console.log('Estates:', estates);

    for (const estate of estates) {
        const { count, error: plotsError } = await supabase
            .from('plots')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', estate.id);

        if (plotsError) {
            console.error(`Error fetching plots for ${estate.name}:`, plotsError);
        } else {
            console.log(`Estate ${estate.name}: Total Plots Config=${estate.total_plots}, Actual Plots Records=${count}`);
        }

        // Check available plots
        const { count: availCount } = await supabase
            .from('plots')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', estate.id)
            .eq('status', 'available');

        console.log(`Estate ${estate.name}: Available=${availCount}`);
    }
}

checkPlots();
