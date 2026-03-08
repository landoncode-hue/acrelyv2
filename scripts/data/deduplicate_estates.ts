
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deduplicateEstates() {
    console.log("🕵️‍♀️ Checking for Duplicate Estates...");

    const ESTATE_NAMES = [
        'Ehi Green Park Estate',
        'Hectares of Diamond Estate',
        'New Era Estate',
        'Ose Perfection Garden',
        'Soar High Estate',
        'Success Palace Estate',
        'Wealthy Place Estate',
        'City of David Estate'
    ];

    for (const name of ESTATE_NAMES) {
        const { data: estates } = await supabase
            .from('estates')
            .select('id, name, created_at')
            .eq('name', name)
            .order('created_at', { ascending: true }); // Keep oldest?

        if (estates && estates.length > 1) {
            console.log(`⚠️  Found ${estates.length} copies of "${name}"`);

            // Keep the first one (oldest), delete the rest?
            // Or delete ALL and let import recreate one?
            // If we just ran "force_clean", it should have deleted ALL of them.
            // If duplicates persist, maybe they have slightly different names?

            const [keep, ...remove] = estates;
            const removeIds = remove.map(e => e.id);

            console.log(`   Keeping ${keep.id}, Deleting ${removeIds.join(', ')}`);

            await supabase.from('payments').delete().in('allocation_id', (
                await supabase.from('allocations').select('id').in('estate_id', removeIds)
            ).data?.map(a => a.id) || []);

            await supabase.from('allocations').delete().in('estate_id', removeIds);
            await supabase.from('plots').delete().in('estate_id', removeIds);
            await supabase.from('estates').delete().in('id', removeIds);

            console.log(`   ✅ Deduped "${name}"`);
        } else if (estates && estates.length === 1) {
            console.log(`✅ "${name}" is unique.`);
        } else {
            console.log(`ℹ️  "${name}" not found (Clean slate).`);
        }
    }
    console.log("🏁 Deduplication check done.");
}

deduplicateEstates();
