
import { SupabaseClient } from "@supabase/supabase-js";
import { generateRandomString } from "../test-utils";

export async function testEstates(adminClient: SupabaseClient) {
    console.log("\n🏡 [TEST] Estate Management");

    const estateName = `Estate ${generateRandomString()}`;

    // 1. Create Estate
    const { data: estate, error: estateError } = await adminClient
        .from('estates')
        .insert({
            name: estateName,
            location: 'Lekki Test Zone',
            price: 5000000,
            total_plots: 50
        })
        .select()
        .single();

    if (estateError) throw new Error(`Create Estate Failed: ${estateError.message}`);
    console.log(`   ✅ Created Estate: ${estate.name} (${estate.id})`);

    // 2. Add Plots
    const plotsToCreate = [];
    for (let i = 1; i <= 5; i++) {
        plotsToCreate.push({
            estate_id: estate.id,
            plot_number: `BLK-A-${i}-${generateRandomString(3)}`,
            dimensions: '500sqm'
        });
    }

    const { data: plots, error: plotsError } = await adminClient
        .from('plots')
        .insert(plotsToCreate)
        .select();

    if (plotsError) throw new Error(`Create Plots Failed: ${plotsError.message}`);
    console.log(`   ✅ Added ${plots.length} Plots to Estate.`);

    return { estate, plots };
}
