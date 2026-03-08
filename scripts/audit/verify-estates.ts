import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EXPECTED_ESTATES = [
    { name: 'Ose Perfection Garden', plots: 300 },
    { name: 'Oduwa Housing Estate', plots: 100 },
    { name: 'New Era of Wealth Estate', plots: 60 },
    { name: 'Ehi Green Park Estate', plots: 40 },
    { name: 'Success Palace Estate', plots: 36 },
    { name: 'City of David Estate', plots: 56 },
    { name: 'Soar High Estate', plots: 106 },
    { name: 'Hectares of Diamond Estate', plots: 300 },
    { name: 'The Wealthy Place Estate', plots: 100 },
];

async function verifyEstates() {
    console.log('🔍 Verifying Estate Seeding Results...\n');
    let allGood = true;

    for (const expected of EXPECTED_ESTATES) {
        const { data: estate } = await supabase
            .from('estates')
            .select('id, name, total_plots, available_plots')
            .eq('name', expected.name)
            .single();

        if (!estate) {
            console.error(`❌ Missing Estate: ${expected.name}`);
            allGood = false;
            continue;
        }

        // Check actual plots in 'plots' table
        const { count: actualPlotCount } = await supabase
            .from('plots')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', estate.id);

        const isCountCorrect = actualPlotCount === expected.plots;

        console.log(`${isCountCorrect ? '✅' : '❌'} ${expected.name.padEnd(30)} | Expected: ${expected.plots.toString().padEnd(4)} | Found: ${actualPlotCount}`);

        if (!isCountCorrect) allGood = false;
    }

    console.log('\n' + (allGood ? '✨ All verifications passed!' : '⚠️ Some verifications failed.'));
}

verifyEstates();
