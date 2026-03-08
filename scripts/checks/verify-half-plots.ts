
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function verify() {
    const { data: allocs, error } = await s.from('allocations')
        .select('id, customer_id, plot_id, plot_half, customers(full_name), plots!allocations_plot_id_fkey(plot_number, half_plot_designation)')
        .eq('notes', 'Imported via Legacy Data Entry');

    if (error) {
        console.error('Error fetching allocations:', error);
        return;
    }

    // Find the plot 6 allocations
    const plot6Records = allocs.filter(a => (a.plots as any)?.plot_number === '6');

    console.log('--- Plot 6 Allocations ---');
    plot6Records.forEach(r => {
        console.log(`Customer: ${(r.customers as any).full_name}`);
        console.log(`Plot: ${(r.plots as any).plot_number}`);
        console.log(`Allocation Half: ${r.plot_half}`);
        console.log(`Current Plot Metadata Half: ${(r.plots as any).half_plot_designation}`);
        console.log('---');
    });

    const halfPlotAlocs = allocs.filter(a => a.plot_half !== null);
    console.log(`Total Allocations with plot_half populated: ${halfPlotAlocs.length}`);
}

verify();
