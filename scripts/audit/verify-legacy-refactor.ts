import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyLegacyRefactor() {
    console.log('🔍 Verifying Legacy Import Refactor...\n');

    // 1. Check for invalid plot numbers (should not contain A/B suffixes if processed correctly)
    // We expect clean numbers like "20", "21". 
    // However, some legacy data might have other suffixes? 
    // We specifically targeted "20A", "20B".
    const { data: invalidPlots } = await supabase
        .from('plots')
        .select('plot_number')
        .or('plot_number.ilike.%A,plot_number.ilike.%B'); // Simple check for ending in A or B

    // Filter strictly for suffix pattern to avoid false positives like "BLOCK A"
    const trulyInvalid = invalidPlots?.filter(p => /^\d+[AB]$/i.test(p.plot_number)) || [];

    if (trulyInvalid.length > 0) {
        console.log(`❌ Found ${trulyInvalid.length} plots with A/B suffixes (Expected 0):`);
        trulyInvalid.slice(0, 5).forEach(p => console.log(`   - ${p.plot_number}`));
    } else {
        console.log('✅ No plots found with A/B suffixes (Clean numbers verified)');
    }

    // 2. Check for half plot allocations
    const { count: halfACount } = await supabase
        .from('plots')
        .select('*', { count: 'exact', head: true })
        .not('half_a_allocation_id', 'is', null);

    const { count: halfBCount } = await supabase
        .from('plots')
        .select('*', { count: 'exact', head: true })
        .not('half_b_allocation_id', 'is', null);

    console.log(`ℹ️  Half A Allocations: ${halfACount}`);
    console.log(`ℹ️  Half B Allocations: ${halfBCount}`);

    if ((halfACount || 0) + (halfBCount || 0) > 0) {
        console.log('✅ Half plot allocations successfully created.');
    } else {
        console.log('⚠️  No half plot allocations found. (Is this expected?)');
    }

    // 3. Check for unassigned allocations
    // Allocations that are NOT in allocation_plots AND NOT linked in plots table
    const { data: allocations } = await supabase
        .from('allocations')
        .select('id, notes')
        .eq('status', 'approved'); // We used 'approved' for imports

    let unassignedCount = 0;
    if (allocations) {
        for (const alloc of allocations) {
            // Check allocation_plots
            const { count: linkCount } = await supabase
                .from('allocation_plots')
                .select('*', { count: 'exact', head: true })
                .eq('allocation_id', alloc.id);

            // Check plots direct links (half plots)
            const { count: halfLinkCount } = await supabase
                .from('plots')
                .select('*', { count: 'exact', head: true })
                .or(`half_a_allocation_id.eq.${alloc.id},half_b_allocation_id.eq.${alloc.id}`);

            if ((linkCount || 0) === 0 && (halfLinkCount || 0) === 0) {
                unassignedCount++;
            }
        }
    }

    console.log(`ℹ️  Unassigned Allocations (No plot links): ${unassignedCount}`);

    // 4. Check for unassigned allocations from unified import
    // In unified CSV, records without 'Plot No' should be unassigned
    console.log('4. Checking unassigned unified records...');
    if (unassignedCount === 0) {
        console.log('ℹ️  No unassigned allocations found.');
    }
}

verifyLegacyRefactor();
