import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const legacyDataDir = path.resolve(__dirname, '../../legacy-data');
const inputFile = path.join(legacyDataDir, 'unified_legacy_data.csv');

interface LegacyRecord {
    Date: string;
    'Customer Name': string;
    'Phone No': string;
    'Plot No': string;
    Description: string;
    'Amount Paid (N)': string;
    'Balance (N)': string;
    'Estate Name': string;
    'Receipt No': string;
    'Allocation Status': string;
    Email: string;
}

function normalize(str: string | undefined): string {
    return (str || '').trim();
}

async function splitData() {
    const csvContent = fs.readFileSync(inputFile, 'utf8');
    const { data } = Papa.parse<LegacyRecord>(csvContent, { header: true, skipEmptyLines: true });

    const customersMap = new Map<string, any>();
    const allocations: any[] = [];
    const payments: any[] = [];

    data.forEach((record, index) => {
        const name = normalize(record['Customer Name']);
        const phone = normalize(record['Phone No']);
        const email = normalize(record['Email']);

        if (!name) return;

        // 1. Customer
        const customerKey = `${name.toLowerCase()}-${phone}`;
        if (!customersMap.has(customerKey)) {
            customersMap.set(customerKey, {
                'Full Name': name,
                'Phone': phone,
                'Email': email || `${name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@legacy.temp`
            });
        }

        // 2. Allocation (if plot or estate exists)
        const estate = normalize(record['Estate Name']);
        const plot = normalize(record['Plot No']);
        if (estate || plot) {
            allocations.push({
                'Customer Name': name,
                'Phone': phone,
                'Estate Name': estate,
                'Plot No': plot,
                'Status': normalize(record['Allocation Status']) || 'draft'
            });
        }

        // 3. Payment
        const amount = normalize(record['Amount Paid (N)']).replace(/[^0-9.]/g, '');
        if (amount && amount !== '0') {
            payments.push({
                'Customer Name': name,
                'Phone': phone,
                'Date': normalize(record['Date']),
                'Amount': amount,
                'Balance': normalize(record['Balance (N)']).replace(/[^0-9.]/g, ''),
                'Receipt No': normalize(record['Receipt No']),
                'Description': normalize(record['Description']) || 'Legacy Payment'
            });
        }
    });

    // Write Files
    const customers = Array.from(customersMap.values());

    fs.writeFileSync(path.join(legacyDataDir, 'customers.csv'), Papa.unparse(customers));
    fs.writeFileSync(path.join(legacyDataDir, 'allocations.csv'), Papa.unparse(allocations));
    fs.writeFileSync(path.join(legacyDataDir, 'payments.csv'), Papa.unparse(payments));

    console.log(`✅ Split complete:`);
    console.log(`- ${customers.length} unique customers`);
    console.log(`- ${allocations.length} allocations`);
    console.log(`- ${payments.length} payments`);
}

splitData();
