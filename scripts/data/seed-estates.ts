
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

// Data provided by user
const ESTATES = [
    { name: 'Ose Perfection Garden', location: 'Off Auchi Road', plots: 300, price: 2000000 },
    { name: 'Oduwa Housing Estate', location: 'Airport Road / Ekehuan Road', plots: 100, price: 3000000 },
    { name: 'New Era of Wealth Estate', location: 'Agbor Road', plots: 60, price: 2800000 },
    { name: 'Ehi Green Park Estate', location: 'Airport Road / Ekehuan Road', plots: 40, price: 3000000 },
    { name: 'Success Palace Estate', location: 'Lagos Road', plots: 36, price: 2800000 },
    { name: 'City of David Estate', location: 'Benin City', plots: 56, price: 1000000 },
    { name: 'Soar High Estate', location: 'Egba Auchi Road', plots: 106, price: 3000000 },
    { name: 'Hectares of Diamond Estate', location: 'Siluko Road', plots: 300, price: 1300000 },
    { name: 'The Wealthy Place Estate', location: 'Siluko Road', plots: 100, price: 1300000 },
];

async function seedEstates() {
    console.log('🏘️  Seeding Estates...');

    for (const estate of ESTATES) {
        // 1. Create or Get Estate
        let estateId = '';
        const { data: existing } = await supabase.from('estates').select('id').eq('name', estate.name).single();

        if (existing) {
            console.log(`ℹ️  Updating ${estate.name}...`);
            await supabase.from('estates').update({
                location: estate.location,
                price: estate.price,
                description: `Official Pinnacle Builders estate.\nLocation: ${estate.location}\nStandard Plot (100x100ft)`
            }).eq('id', existing.id);
            estateId = existing.id;
        } else {
            console.log(`🆕 Creating ${estate.name}...`);
            const { data: newEstate, error } = await supabase.from('estates').insert({
                name: estate.name,
                location: estate.location,
                price: estate.price,
                description: `Official Pinnacle Builders estate.\nLocation: ${estate.location}\nStandard Plot (100x100ft)`,
                status: 'active'
            }).select().single();

            if (error) {
                console.error(`❌ Error creating estate ${estate.name}:`, error.message);
                continue;
            }
            estateId = newEstate.id;
        }

        // 2. Create Plots
        // Check existing plots count
        const { count } = await supabase.from('plots').select('*', { count: 'exact', head: true }).eq('estate_id', estateId);
        const currentCount = count || 0;

        if (currentCount >= estate.plots) {
            console.log(`   ✅ Plots already exist (${currentCount})`);
            continue;
        }

        const toCreate = estate.plots - currentCount;
        console.log(`   🏗️  Generating ${toCreate} plots for ${estate.name}...`);

        const plotsBatch = [];
        for (let i = currentCount + 1; i <= estate.plots; i++) {
            plotsBatch.push({
                estate_id: estateId,
                plot_number: `PLOT-${i.toString().padStart(3, '0')}`,
                size: 930, // ~100x100ft in sqm
                status: 'available'
            });
        }

        // Batch insert (chunks of 100)
        const chunkSize = 100;
        for (let i = 0; i < plotsBatch.length; i += chunkSize) {
            const chunk = plotsBatch.slice(i, i + chunkSize);
            const { error: plotError } = await supabase.from('plots').insert(chunk);
            if (plotError) console.error(`   ❌ Error creating plots chunk:`, plotError.message);
        }
        console.log(`   ✨ Added ${toCreate} plots.`);
    }

    console.log('🏁 Estate Seeding Complete.');
}

seedEstates();
