import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const legacyDataDir = path.resolve(__dirname, '../../legacy-data');
const inputFile = path.join(legacyDataDir, 'unified_legacy_data.csv');

interface LegacyRecord {
    'Amount Paid (N)': string;
    'Balance (N)': string;
    'Estate Name': string;
}

async function extractPrices() {
    const csvContent = fs.readFileSync(inputFile, 'utf8');
    const { data } = Papa.parse<LegacyRecord>(csvContent, { header: true, skipEmptyLines: true });

    const estatePrices = new Map<string, Set<number>>();

    data.forEach((record) => {
        const estate = (record['Estate Name'] || '').trim();
        if (!estate) return;

        const paid = parseFloat((record['Amount Paid (N)'] || '0').replace(/[^0-9.]/g, '')) || 0;
        const balance = parseFloat((record['Balance (N)'] || '0').replace(/[^0-9.]/g, '')) || 0;
        const total = paid + balance;

        if (total > 0) {
            if (!estatePrices.has(estate)) estatePrices.set(estate, new Set());
            estatePrices.get(estate)!.add(total);
        }
    });

    console.log('--- Estate Price Analysis ---');
    estatePrices.forEach((prices, estate) => {
        const sorted = Array.from(prices).sort((a, b) => a - b);
        console.log(`${estate}:`);
        console.log(`  Possible Prices: ${sorted.map(p => p.toLocaleString()).join(' / ')}`);
    });
}

extractPrices();
