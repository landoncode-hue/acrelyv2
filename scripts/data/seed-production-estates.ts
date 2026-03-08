import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ESTATES_TO_SEED = [
    { name: 'Ose Perfection Garden', location: 'Off Auchi Road', plots: 300 },
    { name: 'Oduwa Housing Estate', location: 'Airport Road / Ekehuan Road', plots: 100 },
    { name: 'New Era of Wealth Estate', location: 'Agbor Road', plots: 60 },
    { name: 'Ehi Green Park Estate', location: 'Airport Road / Ekehuan Road', plots: 40 },
    { name: 'Success Palace Estate', location: 'Lagos Road', plots: 36 },
    { name: 'City of David Estate', location: 'Benin City', plots: 56 },
    { name: 'Soar High Estate', location: 'Egba Auchi Road', plots: 106 },
    { name: 'Hectares of Diamond Estate', location: 'Siluko Road', plots: 300 },
    { name: 'The Wealthy Place Estate', location: 'Siluko Road', plots: 100 },
];

async function seedEstates() {
    console.log('🌱 Starting Estate Seeding...');

    for (const estate of ESTATES_TO_SEED) {
        try {
            console.log(`\nProcessing: ${estate.name}`);

            // 1. Check if estate exists
            const { data: existing } = await supabase
                .from('estates')
                .select('id')
                .eq('name', estate.name)
                .single();

            let estateId = existing?.id;

            if (existing) {
                console.log(`   ⏭️  Estate already exists.`);
            } else {
                // 2. Create Estate
                const { data: newEstate, error } = await supabase
                    .from('estates')
                    .insert({
                        name: estate.name,
                        location: estate.location || 'Benin City',
                        description: `Beautiful estate located in ${estate.location || 'Benin City'}`,
                        price: 1500000, // Default price
                        status: 'active',
                        total_plots: estate.plots,
                        available_plots: estate.plots, // Initially all available
                        occupied_plots: 0
                    })
                    .select()
                    .single();

                if (error) {
                    console.error(`   ❌ Error creating estate:`, error.message);
                    continue;
                }
                estateId = newEstate.id;
                console.log(`   ✅ Created estate.`);
            }

            if (!estateId) continue;

            // 3. Create Plots
            // First check how many plots exist
            const { count: currentPlotCount } = await supabase
                .from('plots')
                .select('*', { count: 'exact', head: true })
                .eq('estate_id', estateId);

            const plotsNeeded = estate.plots - (currentPlotCount || 0);

            if (plotsNeeded <= 0) {
                console.log(`   ✅ All ${estate.plots} plots already exist.`);
                continue;
            }

            console.log(`   Creating ${plotsNeeded} plots...`);

            // Check if triggers are enabled for plotting logic, 
            // but for raw speed we might want to insert in batches.
            // Assuming standard plot_number generation logic if not providing it?
            // Or we generate simple plot numbers like "PLOT-001".

            const plotsToInsert = [];
            const startIdx = (currentPlotCount || 0) + 1;

            for (let i = 0; i < plotsNeeded; i++) {
                const plotNum = startIdx + i;
                plotsToInsert.push({
                    estate_id: estateId,
                    plot_number: `PLT-${plotNum.toString().padStart(4, '0')}`,
                    size: 464, // Standard 50x100ft approx
                    status: 'available',
                    price: 1500000 // Inherit estate price usually, but setting explicitly
                });
            }

            // Insert in chunks of 50 to avoid timeout/payload limits
            const CHUNK_SIZE = 50;
            for (let i = 0; i < plotsToInsert.length; i += CHUNK_SIZE) {
                const chunk = plotsToInsert.slice(i, i + CHUNK_SIZE);
                const { error: plotsError } = await supabase
                    .from('plots')
                    .insert(chunk);

                if (plotsError) {
                    console.error(`   ❌ Error inserting plots batch ${i}:`, plotsError.message);
                } else {
                    process.stdout.write('.');
                }
            }
            console.log(`\n   ✅ Added plots.`);

        } catch (error) {
            console.error(`   ❌ Error processing ${estate.name}:`, error);
        }
    }

    console.log('\n✨ Estate seeding completed!');
}

seedEstates();
