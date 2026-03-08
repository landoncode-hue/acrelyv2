import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const legacyDataDir = path.resolve(__dirname, '../../legacy-data');
const inputFile = path.join(legacyDataDir, 'unified_legacy_data.csv');

interface LegacyRecord {
    'Amount Paid (N)': string;
    'Balance (N)': string;
    'Estate Name': string;
}

async function ensureEstates() {
    console.log('🏗️  Ensuring estates from legacy data...');
    const csvContent = fs.readFileSync(inputFile, 'utf8');
    const { data } = Papa.parse<LegacyRecord>(csvContent, { header: true, skipEmptyLines: true });

    const estateData = new Map<string, number>();

    data.forEach((record) => {
        const estate = (record['Estate Name'] || '').trim();
        if (!estate) return;

        const paid = parseFloat((record['Amount Paid (N)'] || '0').replace(/[^0-9.]/g, '')) || 0;
        const balance = parseFloat((record['Balance (N)'] || '0').replace(/[^0-9.]/g, '')) || 0;
        const total = paid + balance;

        if (total > 0) {
            // We'll take the MAX found price as the "standard" or at least a safe base
            const currentMax = estateData.get(estate) || 0;
            if (total > currentMax) estateData.set(estate, total);
        }
    });

    for (const [name, price] of estateData.entries()) {
        console.log(`- Checking ${name} (Base Price: ₦${price.toLocaleString()})`);

        const { data: existing } = await supabase.from('estates').select('id').eq('name', name).single();

        if (!existing) {
            const { error } = await supabase.from('estates').insert({
                name,
                location: 'Inferred from Legacy',
                price,
                total_plots: 100, // Default capacity
                status: 'active'
            });
            if (error) console.error(`  ❌ Error creating ${name}:`, error.message);
            else console.log(`  ✅ Created ${name}`);
        } else {
            // Update price if it exists but is different? Probably better to keep existing if manually edited.
            console.log(`  ℹ️ Already exists`);
        }
    }

    console.log('✅ Estate sync complete.');
}

ensureEstates();
