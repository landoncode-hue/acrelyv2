
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
    console.log('Connecting to DB...');
    const { data: estate, error: estErr } = await supabase.from('estates').select('id, name').ilike('name', '%City of David%').single();

    if (estErr) {
        console.error('Estate Error:', estErr);
        return;
    }
    console.log('Estate found:', estate);

    const { data: plots, error: plotErr } = await supabase.from('plots')
        .select('id, plot_number, status, dimensions, price')
        .eq('estate_id', estate.id)
        .order('plot_number');

    if (plotErr) {
        console.error('Plot Error:', plotErr);
        return;
    }

    console.log(`Found ${plots.length} plots.`);
    // Log sample
    const sold = plots.filter(p => p.status === 'sold' || p.status === 'allocation');
    const avail = plots.filter(p => p.status === 'available');

    console.log('--- Sample Available (Green) ---');
    console.log(JSON.stringify(avail.slice(0, 5), null, 2));

    console.log('--- Sample Sold (Red) ---');
    console.log(JSON.stringify(sold.slice(0, 5), null, 2));

    // Check for mix
    const plotClean = (p: string) => p.replace('PLOT-', '').replace(/^0+/, '');

    // Check if we have both "49" and "PLOT-049" (normalized)
    const plotNums = new Set(plots.map(p => p.plot_number));
    const simpleNums = plots.filter(p => /^\d+$/.test(p.plot_number)).map(p => p.plot_number);
    const complexNums = plots.filter(p => p.plot_number.startsWith('PLOT-')).map(p => p.plot_number);

    console.log(`Simple Numbers: ${simpleNums.length} (e.g. ${simpleNums[0]})`);
    console.log(`Complex Numbers: ${complexNums.length} (e.g. ${complexNums[0]})`);

}

check();
