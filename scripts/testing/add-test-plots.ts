
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPlots() {
    console.log("Fetching estates...");
    const { data: estates, error: estateError } = await supabase.from("estates").select("*");

    if (estateError) {
        console.error("Error fetching estates:", estateError);
        return;
    }

    console.log(`Found ${estates.length} estates.`);

    for (const estate of estates) {
        // Check existing plots
        const { count, error: countError } = await supabase
            .from("plots")
            .select("*", { count: 'exact', head: true })
            .eq("estate_id", estate.id)
            .eq("status", "available");

        if (countError) {
            console.error(`Error checking plots for ${estate.name}:`, countError);
            continue;
        }

        if ((count || 0) > 0) {
            console.log(`Estate ${estate.name} already has ${count} available plots. Skipping.`);
            continue;
        }

        console.log(`Seeding plots for ${estate.name}...`);

        // Create 5 plots
        const plots = Array.from({ length: 5 }).map((_, i) => ({
            estate_id: estate.id,
            plot_number: `${Math.floor(Math.random() * 1000) + 100}`, // Random 3-4 digit number
            price: estate.price,
            size: '600sqm',
            status: 'available',
            type: 'residential' // Assuming a default type
        }));

        const { error: insertError } = await supabase.from("plots").insert(plots);

        if (insertError) {
            console.error(`Failed to insert plots for ${estate.name}:`, insertError);
        } else {
            console.log(`Successfully added 5 plots to ${estate.name}`);
        }
    }
}

seedPlots();
