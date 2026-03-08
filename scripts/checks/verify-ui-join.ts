
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyJoinedData() {
    console.log("Checking JOIN logic...");

    // Mimic the UI query
    const { data: allocations, error } = await supabase
        .from("allocations")
        .select(`
            id,
            plot_id,
            plots:plots!allocations_plot_id_fkey (id, plot_number)
        `)
        .not('plot_id', 'is', 'null')
        .limit(10);

    if (error) {
        console.error("Query Error:", error);
    } else {
        console.log("Sample allocation with plot:", JSON.stringify(allocations[0], null, 2));
    }

    // Specific check for Wealthy Place
    const { data: wealthy } = await supabase.from('estates').select('id').eq('name', 'The Wealthy Place Estate').single();
    if (wealthy) {
        const { data: allocs } = await supabase
            .from("allocations")
            .select(`id, plot_id, plots(plot_number)`)
            .eq('estate_id', wealthy.id)
            .limit(5);
        console.log("\nWealthy Place Samples:", JSON.stringify(allocs, null, 2));
    }
}

verifyJoinedData();
