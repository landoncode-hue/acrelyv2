
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
    console.log('Fetching plots for CITY OF DAVID ESTATE...');

    // First, find the estate ID
    const { data: estates, error: estateError } = await supabase
        .from('estates')
        .select('id, name')
        .ilike('name', '%CITY OF DAVID ESTATE%');

    if (estateError) {
        console.error('Error fetching estates:', estateError);
        return;
    }

    if (!estates || estates.length === 0) {
        console.log('No estate found matching "CITY OF DAVID ESTATE"');
        return;
    }

    console.log(`Found ${estates.length} estates matching "CITY OF DAVID ESTATE"`);
    estates.forEach(e => console.log(`- ${e.name} (${e.id})`));

    const estateId = estates[0].id;

    // Now fetch plots for this estate
    const { data: plots, error: plotsError } = await supabase
        .from('plots')
        .select('id, plot_number, status, estate_id, price')
        .eq('estate_id', estateId);

    if (plotsError) {
        console.error('Error fetching plots:', plotsError);
        return;
    }

    console.log(`Total plots found: ${plots?.length}`);

    // Check statuses
    const statuses = new Set(plots?.map(p => p.status));
    console.log('Unique statuses found:', Array.from(statuses));

    // Check for 'available' specifically
    const availablePlots = plots?.filter(p => p.status === 'available');
    console.log(`Plots with status === 'available': ${availablePlots?.length}`);

    if (availablePlots && availablePlots.length > 0) {
        console.log('Sample plot_number:', availablePlots[0].plot_number, 'Type:', typeof availablePlots[0].plot_number);
    }
}

main();
