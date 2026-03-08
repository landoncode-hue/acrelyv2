import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

const UNIFIED_FILE = path.join(process.cwd(), 'legacy-data', 'unified_legacy_data.csv');

interface UnifiedRow {
    'Date': string;
    'Customer Name': string;
    'Estate Name': string;
    'Email': string | null;
    'Phone Number': string;
    'Address': string;
    'Estate Code': string;
    'Plot No': string;
    'Plot Size': string;
    'Beacon No': string;
    'Amount Paid (N)': string;
    'Balance (N)': string;
    'Referral': string;
    'Payment Status': string;
}

async function findDuplicates() {
    if (!fs.existsSync(UNIFIED_FILE)) {
        console.error('Unified file not found.');
        return;
    }

    const csvContent = fs.readFileSync(UNIFIED_FILE, 'utf8');
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    const rows = parsed.data as UnifiedRow[];

    const nameGroups: { [name: string]: UnifiedRow[] } = {};

    for (const row of rows) {
        const name = (row['Customer Name'] || '').trim().toUpperCase();
        if (!name) continue;

        if (!nameGroups[name]) {
            nameGroups[name] = [];
        }
        nameGroups[name].push(row);
    }

    const duplicates = Object.entries(nameGroups).filter(([name, group]) => group.length > 1);

    if (duplicates.length === 0) {
        console.log('No duplicate names found.');
        return;
    }

    console.log(`Found ${duplicates.length} names with multiple records:\n`);

    for (const [name, group] of duplicates) {
        console.log(`👤 Name: ${name} (${group.length} records)`);
        for (const row of group) {
            const isDummy = (row['Phone Number'] || '').startsWith('080000');
            console.log(`   - Estate: ${row['Estate Name']}, Plot: ${row['Plot No'] || 'N/A'}, Phone: ${row['Phone Number']} ${isDummy ? '[DUMMY]' : ''}`);
        }
        console.log('');
    }
}

findDuplicates();
