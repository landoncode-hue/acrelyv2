
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

async function debugAllocations() {
    console.log("--- Debugging Allocations ---");
    const targetEstates = ['The Wealthy Place Estate', 'Hectares of Diamond Estate'];

    for (const name of targetEstates) {
        const { data: estate } = await supabase.from('estates').select('id, name').eq('name', name).single();
        if (estate) {
            console.log(`\nEstate: ${estate.name}`);
            const { data: allocations } = await supabase
                .from('allocations')
                .select('id, plot_id, status, created_at')
                .eq('estate_id', estate.id);

            if (allocations) {
                console.log(`Found ${allocations.length} allocations.`);
                const orphan = allocations.filter(a => !a.plot_id);
                console.log(`Orphan Allocations (No Plot ID): ${orphan.length}`);
                if (orphan.length > 0) {
                    console.log("Sample Orphan:", orphan[0]);
                }
            }
        }
    }
}

debugAllocations();
