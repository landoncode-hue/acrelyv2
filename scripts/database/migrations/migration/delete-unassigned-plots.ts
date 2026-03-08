import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteUnassignedPlots() {
    console.log('🗑️  Deleting P-UNASSIGNED plots...\n');

    // Get all P-UNASSIGNED plots
    const { data: unassignedPlots, error: fetchError } = await supabase
        .from('plots')
        .select('id, plot_number, status, estates(name)')
        .like('plot_number', 'P-UNASSIGNED%');

    if (fetchError) {
        console.error('Error fetching P-UNASSIGNED plots:', fetchError);
        return;
    }

    if (!unassignedPlots || unassignedPlots.length === 0) {
        console.log('✅ No P-UNASSIGNED plots found.');
        return;
    }

    console.log(`Found ${unassignedPlots.length} P-UNASSIGNED plots:\n`);

    // Group by estate
    const grouped: Record<string, any[]> = {};
    unassignedPlots.forEach(plot => {
        const estateName = plot.estates.name;
        if (!grouped[estateName]) grouped[estateName] = [];
        grouped[estateName].push(plot);
    });

    // Display breakdown
    Object.entries(grouped).forEach(([estate, plots]) => {
        console.log(`  ${estate}: ${plots.length} plots`);
    });

    console.log('\n🔄 Deleting plots...\n');

    // Delete all P-UNASSIGNED plots
    const plotIds = unassignedPlots.map(p => p.id);
    const { error: deleteError } = await supabase
        .from('plots')
        .delete()
        .in('id', plotIds);

    if (deleteError) {
        console.error('❌ Error deleting plots:', deleteError);
        return;
    }

    console.log(`✅ Successfully deleted ${unassignedPlots.length} P-UNASSIGNED plots\n`);

    // Verification
    const { count: remainingCount } = await supabase
        .from('plots')
        .select('*', { count: 'exact', head: true })
        .like('plot_number', 'P-UNASSIGNED%');

    console.log(`📋 Verification: ${remainingCount} P-UNASSIGNED plots remaining`);
}

deleteUnassignedPlots().catch(console.error);
