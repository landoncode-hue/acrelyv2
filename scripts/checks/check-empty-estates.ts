
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

async function checkEmptyEstates() {
    const targetEstates = ['The Wealthy Place Estate', 'Hectares of Diamond Estate'];

    console.log("--- Checking Potentially Empty Estates ---");

    for (const name of targetEstates) {
        console.log(`\nAnalyzing: ${name}`);
        const { data: estate } = await supabase.from('estates').select('id').eq('name', name).single();

        if (!estate) {
            console.log("Estate not found!");
            continue;
        }

        // Check Allocations
        const { count: allocations } = await supabase
            .from('allocations')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', estate.id);

        // Check Payments via join (if possible) or just raw payments if they have estate_id (schema check needed)
        // Assuming payments might link to allocations or directly to estate. 
        // Let's check allocations first as that is the primary link.

        console.log(`- Allocations Found: ${allocations}`);

        // Check Plots status breakdown
        const { data: plots } = await supabase.from('plots').select('status, count').eq('estate_id', estate.id);
        // checking raw plots is better
        const { count: total_plots } = await supabase.from('plots').select('*', { count: 'exact', head: true }).eq('estate_id', estate.id);
        const { count: available_plots } = await supabase.from('plots').select('*', { count: 'exact', head: true }).eq('estate_id', estate.id).eq('status', 'available');

        console.log(`- Plots: Total=${total_plots}, Available=${available_plots}`);
    }
}

checkEmptyEstates();
