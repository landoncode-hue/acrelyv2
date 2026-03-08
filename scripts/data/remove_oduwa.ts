
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function removeOduwa() {
    console.log("Removing Oduwa Housing Estate...");

    // Find Estate
    const { data: estate } = await supabase.from('estates').select('id').ilike('name', 'Oduwa Housing Estate').single();
    if (!estate) {
        console.log("Oduwa Housing Estate not found.");
        return;
    }

    const { id } = estate;

    // Delete Payments via Allocations
    const { data: allocs } = await supabase.from('allocations').select('id').eq('estate_id', id);
    if (allocs && allocs.length > 0) {
        const aIds = allocs.map(a => a.id);
        await supabase.from('payments').delete().in('allocation_id', aIds);
        await supabase.from('allocations').delete().in('id', aIds);
    }

    // Delete Plots
    await supabase.from('plots').delete().eq('estate_id', id);

    // Delete Estate
    await supabase.from('estates').delete().eq('id', id);

    console.log("✅ Oduwa Housing Estate deleted.");
}

removeOduwa();
