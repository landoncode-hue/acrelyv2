import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

async function resetEstates() {
    console.log('🚨 WARNING: This will delete ALL estates and their related data (plots, allocations, etc).');
    console.log('Starting in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 1. Delete all estates
    console.log('\n🗑️  Deleting all existing estates...');
    const { error: deleteError } = await supabase.from('estates').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (deleteError) {
        console.error('❌ Error deleting estates:', deleteError.message);
        // Sometimes cascade fails or isn't set up. We might need to delete children first if FK constraints block.
        // Assuming cascade is ON. If not, we'll see an error.
    } else {
        console.log('✅ Deleted all estates.');
    }

    // 2. Create Estates
    console.log('\n🏗️  Creating estates...');
    for (const estate of ESTATES) {
        const { data: newEstate, error: createError } = await supabase
            .from('estates')
            .insert({
                name: estate.name,
                location: estate.location,
                total_plots: estate.total_plots,
                available_plots: estate.total_plots,
                price: estate.price,
                status: 'active',
                is_test: false // Treat as prod/real data structure
            })
            .select()
            .single();

        if (createError) {
            console.error(`❌ Failed to create ${estate.name}:`, createError.message);
            continue;
        }

        console.log(`✅ Created ${estate.name}`);

        // 3. Create Plots
        // Batch insert plots
        const plots = [];
        for (let i = 1; i <= estate.total_plots; i++) {
            plots.push({
                estate_id: newEstate.id,
                plot_number: `PLOT-${i.toString().padStart(3, '0')}`,
                status: 'available',
                dimensions: '50x100', // Standard size
                price: estate.price // Use estate price
            });
        }

        // Insert in batches
        const BATCH_SIZE = 100;
        for (let i = 0; i < plots.length; i += BATCH_SIZE) {
            const batch = plots.slice(i, i + BATCH_SIZE);
            const { error: plotError } = await supabase.from('plots').insert(batch);
            if (plotError) {
                console.error(`   ❌ Error creating plots for ${estate.name}:`, plotError.message);
            }
        }
        console.log(`   📍 Created ${plots.length} plots`);
    }

    console.log('\n✨ Reset complete!');
}

resetEstates().catch(console.error);
