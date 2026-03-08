
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyHalfPlots() {
    console.log("--- Verifying Half-Plot Allocations ---");

    // Select all allocations that are half-plots
    const { data: allocations, error } = await supabase
        .from('allocations')
        .select(`
            id,
            plot_size,
            customer_facing_name,
            plot_id,
            plots ( plot_number )
        `)
        .eq('plot_size', 'half_plot');

    if (error) {
        console.error("Error fetching allocations:", error);
        return;
    }

    if (!allocations || allocations.length === 0) {
        console.log("No half-plot allocations found.");
        return;
    }

    console.log(`Found ${allocations.length} half-plot allocations.`);

    // Group by base plot to see if A and B are both there
    const grouped: Record<string, string[]> = {};

    allocations.forEach(a => {
        // @ts-expect-error - plot_number is fetched in joined query but type inference fails here
        const baseNum = a.plots?.plot_number;
        const suffixes = grouped[baseNum] || [];
        suffixes.push(a.customer_facing_name);
        grouped[baseNum] = suffixes;
    });

    for (const [base, names] of Object.entries(grouped)) {
        console.log(`Plot ${base}: ${names.join(", ")}`);
    }
}

verifyHalfPlots();
