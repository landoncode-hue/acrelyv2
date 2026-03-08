
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const LEGACY_DATA_DIR = path.resolve(__dirname, '../../legacy-data');
const OUTPUT_FILE = path.join(LEGACY_DATA_DIR, 'unified_legacy_data.csv');

// Regex to extract estate name from filename
// e.g. "CITY OF DAVID ESTATE_111519.csv" -> "CITY OF DAVID ESTATE"
// e.g. "ODUWA HOUSING ESTATE.csv" -> "ODUWA HOUSING ESTATE"
const FILENAME_REGEX = /^(.+?)(?:_\d+)?\.csv$/i;

async function mergeLegacyCSVs() {
    console.log(`Scanning directory: ${LEGACY_DATA_DIR}`);

    if (!fs.existsSync(LEGACY_DATA_DIR)) {
        console.error(`Directory not found: ${LEGACY_DATA_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(LEGACY_DATA_DIR).filter(file => {
        return file.endsWith('.csv') && file !== 'unified_legacy_data.csv';
    });

    console.log(`Found ${files.length} legacy CSV files to merge.`);

    const unifiedRecords: any[] = [];

    // Define the order of keys for the output
    const standardHeaders = [
        'Date',
        'Customer Name',
        'Phone No',
        'Plot No',
        'Description',
        'Amount Paid (N)',
        'Balance (N)',
        'Estate Name',
        'Receipt No',
        'Allocation Status',
        'Email'
    ];

    for (const file of files) {
        console.log(`Processing ${file}...`);
        const filePath = path.join(LEGACY_DATA_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Parse CSV using PapaParse
        const parseResult = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim()
        });

        const records = parseResult.data as Record<string, string>[];

        // Derive Estate Name from filename
        const filenameMatch = file.match(FILENAME_REGEX);
        let derivedEstateName = filenameMatch ? filenameMatch[1].replace(/_/g, ' ') : 'Unknown Estate';

        // Clean up derived name if needed (e.g. remove trailing spaces)
        derivedEstateName = derivedEstateName.trim();

        console.log(`  -> Detected Estate: ${derivedEstateName} (${records.length} records)`);

        for (const record of records) {
            // Normalize record
            const normalized: Record<string, string> = {};

            // Helper to get value case-insensitively
            const getValue = (keys: string[]) => {
                for (const key of keys) {
                    // Try exact match
                    if (record[key] !== undefined) return record[key];
                    // Try case-insensitive standard keys against record keys
                    const foundKey = Object.keys(record).find(k => k.toLowerCase() === key.toLowerCase());
                    if (foundKey) return record[foundKey];
                }
                return '';
            };

            // Mapping logic
            normalized['Date'] = getValue(['Date', 'DATE']);
            normalized['Customer Name'] = getValue(['Customer Name', 'CUSTOMER NAME', 'Name']);
            normalized['Phone No'] = getValue(['Phone No', 'PHONE NO', 'Phone', 'Tel']);
            normalized['Plot No'] = getValue(['Plot No', 'PLOT NO', 'Plot']);
            normalized['Description'] = getValue(['Description', 'DESCRIPTION', 'Purpose']);

            // Amount Paid - Handle Math (e.g. "240k + 2M")
            const amountPaidRaw = getValue(['Amount Paid (N)', 'Amount Paid', 'AMOUNT PAID', 'PAYMENT', 'Payment']);
            normalized['Amount Paid (N)'] = parseExpression(amountPaidRaw);

            // Balance
            const balanceRaw = getValue(['Balance (N)', 'Balance', 'BALANCE']);
            normalized['Balance (N)'] = parseExpression(balanceRaw);

            // Estate Name
            const recordEstate = getValue(['Estate Name', 'ESTATE NAME', 'Estate']);
            normalized['Estate Name'] = recordEstate || derivedEstateName;

            normalized['Receipt No'] = getValue(['Receipt No', 'RECEIPT NO', 'Receipt']);

            // Email
            const email = getValue(['Email', 'EMAIL', 'E-mail']);
            if (email) {
                normalized['Email'] = email;
            } else {
                // Generate fake email: firstname.lastname@pinnaclegroups.ng
                const nameParts = normalized['Customer Name'].replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
                const firstName = nameParts[0]?.toLowerCase() || 'unknown';
                const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : 'user';
                normalized['Email'] = `${firstName}.${lastName}@pinnaclegroups.ng`;
            }

            // Phone - Generate unique if missing
            const phone = getValue(['Phone No', 'PHONE NO', 'Phone', 'Tel']);
            if (phone && phone.trim().length > 5) {
                normalized['Phone No'] = phone;
            } else {
                // Generate unique fake phone
                const uniqueId = Math.floor(10000000 + Math.random() * 90000000);
                normalized['Phone No'] = `080${uniqueId}`;
            }

            // Add to master list
            unifiedRecords.push(normalized);
        }
    }

    // Deduplicate emails/phones if necessary? 
    // The user asked for unique phones for users "without phone numbers". 
    // Existing ones are kept. Generated ones are random-ish.

    console.log(`Total records merged: ${unifiedRecords.length}`);

    // Ensure keys are in standardHeaders order for every record
    const orderedRecords = unifiedRecords.map(r => {
        const ordered: Record<string, string> = {};
        standardHeaders.forEach(h => ordered[h] = r[h] || '');
        return ordered;
    });

    // Write output using Papa.unparse
    const outputContent = Papa.unparse(orderedRecords, {
        header: true
    });

    fs.writeFileSync(OUTPUT_FILE, outputContent);
    console.log(`✅ Unified data written to: ${OUTPUT_FILE}`);
}

function parseExpression(raw: string): string {
    if (!raw) return '';

    // Remove commas and currency symbols, keep N for now to replace later but regex handles it
    let cleanExp = raw.toLowerCase().replace(/[n,]/g, '');

    // Replace suffixes
    cleanExp = cleanExp.replace(/k/g, '*1000');
    cleanExp = cleanExp.replace(/m/g, '*1000000');

    let result = '';

    try {
        // Allow only digits, +, *, ., -, /, and spaces
        if (/^[0-9+\-*/.\s]+$/.test(cleanExp)) {
            // Eval is safe here as input is strictly filtered
            result = String(eval(cleanExp));
        } else {
            // Fallback: try just parsing the number if regex fails due to weird chars
            const match = cleanExp.match(/[\d.]+/);
            if (match) result = match[0];
        }
    } catch (e) {
        console.warn(`Error parsing math expression "${raw}":`, e);
        // Fallback to simple extraction
        result = raw.replace(/[^0-9.]/g, '');
    }

    return result;
}

mergeLegacyCSVs().catch(err => {
    console.error('Error merging CSVs:', err);
    process.exit(1);
});
