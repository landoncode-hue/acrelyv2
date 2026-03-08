
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    const csvPath = path.resolve('legacy-data/sanitized_legacy_data.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const { data: records } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    console.log(`🔍 Verifying ${records.length} records...`);

    // 1. Fetch maps for verification
    const { data: dbCustomers } = await supabase.from('customers').select('id, full_name, phone');
    const customerMap = new Map();
    dbCustomers?.forEach(c => customerMap.set(c.phone, c.id));

    const { data: dbEstates } = await supabase.from('estates').select('id, name');
    const estateMap = new Map();
    dbEstates?.forEach(e => estateMap.set(e.name.toLowerCase(), e.id));

    const { data: dbPlots } = await supabase.from('plots').select('id, estate_id, plot_number');
    const plotMap = new Map();
    dbPlots?.forEach(p => plotMap.set(`${p.estate_id}-${p.plot_number}`, p.id));

    const { data: dbAllocations } = await supabase.from('allocations').select('customer_id, plot_id');
    const allocationSet = new Set(dbAllocations?.map(a => `${a.customer_id}-${a.plot_id}`));

    const rejected = [];
    const incomplete = [];

    for (let i = 0; i < records.length; i++) {
        const row = records[i] as any;
        const name = row['Customer Name']?.trim();
        const estate = row['Sanitized Estate']?.trim();
        const plotNumber = row['Plot Number']?.trim();
        const phone = row['Phone No']?.trim();

        if (!name || !estate || !plotNumber) {
            incomplete.push({ row: i + 2, name: name || 'Empty', reason: 'Missing Name/Estate/Plot' });
            continue;
        }

        // Use pre-processed plot number directly

        const estateId = estateMap.get(estate.toLowerCase());
        let customerId = customerMap.get(phone);
        if (!customerId && phone.startsWith('0')) {
            customerId = customerMap.get('234' + phone.substring(1));
        }

        const plotId = estateId ? plotMap.get(`${estateId}-${plotNumber}`) : null;

        const isAllocated = customerId && plotId && allocationSet.has(`${customerId}-${plotId}`);

        if (!isAllocated) {
            let reason = 'Unknown';
            if (!estateId) reason = `Estate "${estate}" not found`;
            else if (!plotId) reason = `Plot "${plotNumber}" not found in ${estate}`;
            else if (!customerId) reason = `Customer profile not found (Phone: ${phone})`;
            else reason = 'Allocation record missing in DB';

            rejected.push({
                row: i + 2,
                name,
                estate,
                plotNo: plotNumber,
                reason
            });
        }
    }

    console.log(`\n❌ INCOMPLETE ROWS (${incomplete.length}):`);
    incomplete.forEach(r => console.log(`Row ${r.row}: ${r.name} - ${r.reason}`));

    console.log(`\n⚠️  REJECTED/MISSING RECORDS (${rejected.length}):`);
    rejected.forEach(r => console.log(`Row ${r.row}: ${r.name} (${r.estate} #${r.plotNo}) - ${r.reason}`));
}

verify();
