import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
    // Try to update a plot with just half_plot fields
    const { data: plots, error: fetchError } = await supabase
        .from('plots')
        .select('id, plot_number, status, estate_id')
        .eq('plot_number', '23')
        .limit(1);

    if (fetchError) {
        console.log('Fetch error:', fetchError.message);
        return;
    }

    if (!plots || plots.length === 0) {
        console.log('No plot 23 found');
        return;
    }

    const plot = plots[0];
    console.log('Found plot:', plot);

    // Try update with SERVICE ROLE KEY (should work)
    console.log('\nTrying update with service role...');
    const { data, error } = await supabase
        .from('plots')
        .update({
            is_half_plot: true,
            half_plot_designation: 'B'
        })
        .eq('id', plot.id)
        .select();

    if (error) {
        console.log('Update error:', error.message);
        console.log('Error code:', error.code);
    } else {
        console.log('Update success:', data);
    }
}

test();
