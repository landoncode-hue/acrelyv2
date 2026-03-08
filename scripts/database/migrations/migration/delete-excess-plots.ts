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

const TARGET_COUNTS: Record<string, number> = {
    'Ose Perfection Garden': 300,
    'Oduwa Housing Estate': 100,
    'New Era of Wealth Estate': 60,
    'Ehi Green Park Estate': 40,
    'Success Palace Estate': 36,
    'City of David Estate': 56,
    'Soar High Estate': 106,
    'Hectares of Diamond Estate': 300,
    'The Wealthy Place Estate': 100
};

async function deleteExcessPlots() {
    console.log('🗑️  Starting excess plot deletion...\n');

    const { data: estates, error: estatesError } = await supabase
        .from('estates')
        .select('id, name')
        .order('name');

    if (estatesError) {
        console.error('Error fetching estates:', estatesError);
        return;
    }

    let totalDeleted = 0;

    for (const estate of estates!) {
        const targetCount = TARGET_COUNTS[estate.name];

        // Get current plot counts
        const { count: currentTotal } = await supabase
            .from('plots')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', estate.id);

        const { count: soldCount } = await supabase
            .from('plots')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', estate.id)
            .eq('status', 'sold');

        const excessCount = currentTotal! - targetCount;

        if (excessCount <= 0) {
            console.log(`✅ ${estate.name}: Already at target (${currentTotal}/${targetCount})`);
            continue;
        }

        console.log(`\n📊 ${estate.name}:`);
        console.log(`   Current: ${currentTotal}, Target: ${targetCount}, Sold: ${soldCount}`);
        console.log(`   Excess to delete: ${excessCount}`);

        // Get available plots to delete (sorted by plot_number descending to keep lower numbers)
        const { data: plotsToDelete, error: fetchError } = await supabase
            .from('plots')
            .select('id, plot_number')
            .eq('estate_id', estate.id)
            .eq('status', 'available')
            .order('plot_number', { ascending: false })
            .limit(excessCount);

        if (fetchError) {
            console.error(`   ❌ Error fetching plots:`, fetchError);
            continue;
        }

        if (!plotsToDelete || plotsToDelete.length === 0) {
            console.log(`   ⚠️  No available plots to delete`);
            continue;
        }

        // Delete the excess plots
        const plotIds = plotsToDelete.map(p => p.id);
        const { error: deleteError } = await supabase
            .from('plots')
            .delete()
            .in('id', plotIds);

        if (deleteError) {
            console.error(`   ❌ Error deleting plots:`, deleteError);
            continue;
        }

        totalDeleted += plotsToDelete.length;
        console.log(`   ✅ Deleted ${plotsToDelete.length} plots`);
    }

    console.log(`\n✅ Deletion complete! Total plots deleted: ${totalDeleted}`);

    // Verification
    console.log('\n📋 Verification:');
    for (const estate of estates!) {
        const { count: finalCount } = await supabase
            .from('plots')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', estate.id);

        const targetCount = TARGET_COUNTS[estate.name];
        const status = finalCount === targetCount ? '✅' : '❌';
        console.log(`   ${status} ${estate.name}: ${finalCount}/${targetCount}`);
    }
}

deleteExcessPlots().catch(console.error);
