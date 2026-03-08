
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

async function verify() {
    console.log("Checking Soar High Estate...");
    const { data } = await supabase.from('estates').select('*').eq('name', 'Soar High Estate').single();
    if (data) {
        console.log("DB Data:", data);
        console.log(`Calculated Sold: ${data.total_plots} - ${data.available_plots} = ${data.total_plots - data.available_plots}`);
    } else {
        console.log("Estate not found");
    }
}

verify();
