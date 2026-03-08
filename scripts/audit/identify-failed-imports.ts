
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Papa from 'papaparse';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkMissing() {
    // 1. Load CSV
    const csvPath = path.resolve(__dirname, '../../legacy-data/unified_legacy_data_cleaned.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const { data: records } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    console.log(`📋 Loaded ${records.length} records from CSV`);

    // 2. Load all customers from DB
    // We'll fetch email and phone to match
    let allCustomers: any[] = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('customers')
            .select('email, phone')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error('Error fetching customers:', error);
            break;
        }

        if (!data || data.length === 0) break;
        allCustomers = [...allCustomers, ...data];
        if (data.length < pageSize) break;
        page++;
    }

    console.log(`🗄️  Loaded ${allCustomers.length} customers from DB`);

    // Create lookup sets
    const dbEmails = new Set(allCustomers.map(c => c.email?.toLowerCase().trim()).filter(Boolean));
    const dbPhones = new Set(allCustomers.map(c => c.phone?.replace(/\D/g, '')).filter(Boolean));

    // 3. Compare
    const missing: any[] = [];

    for (const record of records as any[]) {
        const email = record['Email']?.toLowerCase().trim();
        const rawPhone = record['Phone No']?.toString() || '';
        // Clean phone same way as likely stored (if 070... format)
        // Adjust phone logic if needed based on how it's stored
        const phone = rawPhone.replace(/\D/g, '');

        const foundByEmail = email && dbEmails.has(email);
        // Phone matching logic might need to be fuzzy (e.g. last 10 digits)?
        // For now exact match on digits
        const foundByPhone = phone && dbPhones.has(phone);

        if (!foundByEmail && !foundByPhone) {
            missing.push({
                name: record['Customer Name'],
                email: email,
                phone: phone,
                estate: record['Estate Name'],
                plot: record['Plot No'],
                row: (records.indexOf(record) + 1)
            });
        }
    }

    console.log(`\n❌ Found ${missing.length} missing records (failed to import):`);
    console.log('---------------------------------------------------');
    if (missing.length > 0) {
        // Print as json for easier reading/parsing
        console.log(JSON.stringify(missing, null, 2));
    } else {
        console.log('✅ All records seem to be imported!');
    }
}

checkMissing().catch(console.error);
