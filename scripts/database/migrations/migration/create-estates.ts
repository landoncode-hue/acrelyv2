import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const ESTATES = [
    { name: 'Ose Perfection Garden', location: 'Off Auchi Road', total_plots: 300, price: 1500000 },
    { name: 'Oduwa Housing Estate', location: 'Airport Road / Ekehuan Road', total_plots: 100, price: 2000000 },
    { name: 'New Era of Wealth Estate', location: 'Agbor Road', total_plots: 60, price: 3000000 },
    { name: 'Ehi Green Park Estate', location: 'Airport Road / Ekehuan Road', total_plots: 40, price: 2500000 },
    { name: 'Success Palace Estate', location: 'Lagos Road', total_plots: 36, price: 2000000 },
    { name: 'City of David Estate', location: 'Airport Road', total_plots: 56, price: 3000000 },
    { name: 'Soar High Estate', location: 'Egba Auchi Road', total_plots: 106, price: 1500000 },
    { name: 'Hectares of Diamond Estate', location: 'Siluko Road', total_plots: 300, price: 1000000 },
    { name: 'The Wealthy Place Estate', location: 'Siluko Road', total_plots: 100, price: 1000000 }
];

async function createEstatesAndPlots() {
    console.log('🏘️  Creating estates and plots...\n');

    for (const estate of ESTATES) {
        // Check if estate exists
        const { data: existing } = await supabase.from('estates').select('id').eq('name', estate.name).single();

        if (existing) {
            console.log(`⏭️  ${estate.name} already exists`);
            continue;
        }

        // Create estate
        const { data: newEstate, error: estateError } = await supabase.from('estates').insert({
            name: estate.name,
            location: estate.location,
            total_plots: estate.total_plots,
            available_plots: estate.total_plots,
            price: estate.price,
            status: 'active'
        }).select().single();

        if (estateError) {
            console.error(`❌ Error creating ${estate.name}:`, estateError.message);
            continue;
        }

        console.log(`✅ Created ${estate.name} (${estate.total_plots} plots)`);

        // Create sequential plots
        const plots = [];
        for (let i = 1; i <= estate.total_plots; i++) {
            plots.push({
                estate_id: newEstate.id,
                plot_number: i.toString(),
                status: 'available',
                dimensions: '100/100'
            });
        }

        // Insert plots in batches of 50
        for (let i = 0; i < plots.length; i += 50) {
            const batch = plots.slice(i, i + 50);
            const { error: plotError } = await supabase.from('plots').insert(batch);
            if (plotError) {
                console.error(`❌ Error creating plots for ${estate.name}:`, plotError.message);
                break;
            }
        }

        console.log(`   📍 Created ${estate.total_plots} plots`);
    }

    console.log('\n✅ Estate setup complete!');
}

createEstatesAndPlots().catch(console.error);
