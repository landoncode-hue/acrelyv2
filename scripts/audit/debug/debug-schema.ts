
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking DB Schema...");

    // Check Allocations Table for plot_size
    const { data: alloc, error: allocError } = await supabase
        .from('allocations')
        .select('plot_size')
        .limit(1)
        .maybeSingle();

    if (allocError) {
        console.error("Error selecting plot_size from allocations:", allocError.message);
    } else {
        console.log("Allocations plot_size query success.");
        // If column didn't exist, it might have thrown error or returned ignore? 
        // Supabase usually throws "Could not find the 'plot_size' column ..."
    }

    // Check Plot Status Enum by attempting to update the logic
    // We can't query enum types directly easily via JS client without RPC.
    // But we can try to insert a dummy plot with 'partially_allocated' status.

    const dummyId = '00000000-0000-0000-0000-000000000000'; // Invalid UUID usually safe or random
    // Actually create a real valid uuid
    const { data: estate } = await supabase.from('estates').select('id').limit(1).single();

    if (!estate) {
        console.log("No estates found to test plot creation.");
        return;
    }

    console.log("Testing 'partially_allocated' status insert...");
    const { data: plot, error: plotError } = await supabase.from('plots').insert({
        estate_id: estate.id,
        plot_number: 'DEBUG-TEST',
        status: 'partially_allocated',
        price: 1000
    }).select().maybeSingle();

    if (plotError) {
        console.error("Failed to insert plot with status 'partially_allocated':", plotError.message);
    } else {
        console.log("Successfully inserted plot with 'partially_allocated' status.");
        // Cleanup
        if (plot) {
            await supabase.from('plots').delete().eq('id', plot.id);
            console.log("Cleaned up debug plot.");
        }
    }
}

checkSchema();
