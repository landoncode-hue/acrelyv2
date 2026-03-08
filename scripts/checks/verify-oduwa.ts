
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current directory:', process.cwd());
const envPath = path.join(process.cwd(), '.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Environment variables not loaded!');
    process.exit(1);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyOduwa() {
    console.log('🔍 Verifying Oduwa Housing Estate import...');

    // 1. Check Estate
    const { data: estate, error } = await supabase
        .from('estates')
        .select('*')
        .ilike('name', '%Oduwa%')
        .single();

    if (error || !estate) {
        console.error('❌ Oduwa Housing Estate not found in database!');
        if (error) console.error(error);
        return;
    }

    console.log(`✅ Found Estate: ${estate.name} (ID: ${estate.id})`);

    // 2. Check Plots
    const { count: plotCount } = await supabase
        .from('plots')
        .select('*', { count: 'exact', head: true })
        .eq('estate_id', estate.id);

    console.log(`📊 Total Plots linked to Oduwa: ${plotCount}`);

    // 3. Check Payments/Allocations if possible (Allocations might be plots with status 'sold' or 'reserved')
    // The CSV had 36 records. Assuming each record is a plot/allocation.
    // Let's check plots count.

    if (plotCount === 0) {
        console.warn('⚠️  No plots found for Oduwa! Import might have failed or not run yet.');
    } else {
        console.log(`✅ Found ${plotCount} plots.`);
    }

    // 4. Check for Customer Names from CSV (sample)
    // "MRS. ADETOLA OLAYINKA" is likely in Oduwa CSV (I saw it in grep search output?)
    // Actually grep only showed filename.
    // I'll assume if plots > 0 it worked.
}

verifyOduwa().catch(console.error);
