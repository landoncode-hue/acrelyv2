
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log("🔍 Verifying Import Fixes...\n");

    // 1. Verify Ehi Green Park Swap
    // Expected: Ehigiator Stanley -> Plot 16 (NOT 100)
    const { data: ehiCust } = await supabase.from('customers').select('id, full_name').ilike('full_name', '%Ehigiator Stanley%').single();
    if (!ehiCust) console.log("❌ Ehigiator Stanley not found!");
    else {
        const { data: allocs } = await supabase.from('allocations')
            .select('plot_id, plots(plot_number, estate_id, estates(name))')
            .eq('customer_id', ehiCust.id);

        (allocs as any)?.forEach((a: any) => {
            const estateName = Array.isArray(a.plots?.estates) ? a.plots?.estates[0]?.name : a.plots?.estates?.name;
            console.log(`✅ Ehigiator Stanley Allocation: Estate "${estateName}" -> Plot "${a.plots?.plot_number}"`);
        });
    }

    // 2. Verify OSE Conflict
    // Expected: Plot 142 assigned to ONE person.
    const { data: oseEstate } = await supabase.from('estates').select('id').ilike('name', '%OSE PERFECTION%').single();
    if (oseEstate) {
        const { data: plot142 } = await supabase.from('plots').select('id').eq('estate_id', oseEstate.id).eq('plot_number', '142').single();
        if (plot142) {
            const { data: owners } = await supabase.from('allocations').select('customer_id, customers(full_name)').eq('plot_id', plot142.id);
            console.log(`\n🔍 OSE Plot 142 Owners:`);
            (owners as any)?.forEach((o: any) => console.log(`   - ${o.customers?.full_name}`));
        } else {
            console.log("\n❌ OSE Plot 142 not found.");
        }
    }
}

main().catch(console.error);
