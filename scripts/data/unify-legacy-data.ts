import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import { glob } from 'glob';

const LEGACY_DATA_DIR = path.join(process.cwd(), 'legacy-data');
const OUTPUT_FILE = path.join(process.cwd(), 'legacy-data', 'unified_legacy_data.csv');
const REJECTED_FILE = path.join(process.cwd(), 'legacy-data', 'rejected_legacy_data.csv');

interface LegacyRow {
    [key: string]: string;
}

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

const estateNameMap: { [key: string]: string } = {
    'CITY OF DAVID ESTATE': 'City of David Estate',
    'EHI GREEN PARK ESTATE': 'Ehi Green Park Estate',
    'HECTARES OF DIAMOND ESTATE': 'Hectares of Diamond Estate',
    'NEW ERA ESTATE': 'New Era of Wealth Estate',
    'OSE PERFECTION GARDEN': 'Ose Perfection Garden',
    'SOAR HIGH ESTATE': 'Soar High Estate',
    'SUCCESS PALACE ESTATE': 'Success Palace Estate',
    'WEALTHY PLACE ESTATE': 'The Wealthy Place Estate'
};

const fieldMappings: { [key: string]: string[] } = {
    DATE: ['DATE'],
    'CUSTOMER NAME': ['CUSTOMER NAME'],
    'PHONE NUMBER': ['PHONE NUMBER', 'PHONE NO'],
    ADDRESS: ['ADDRESS', 'ADDRESSS'],
    'ESTATE CODE': ['ESTATE CODE', 'CODE'],
    'PLOT NO': ['PLOT NO'],
    'PLOT SIZE': ['PLOT SIZE'],
    'BEACON NO': ['BEACON NO'],
    'PAYMENT AMOUNT': ['PAYMENT', 'AMOUNT PAID'],
    BALANCE: ['BALANCE'],
    REFERRAL: ['REFERRAL', 'REFERRED BY', 'REFERED BY', 'REFFERED BY'],
};

function getMappedValue(row: LegacyRow, targetField: string): string {
    const synonyms = fieldMappings[targetField] || [targetField];
    for (const synonym of synonyms) {
        if (row[synonym] !== undefined) {
            return row[synonym].trim();
        }
    }
    return '';
}

function parseMathExpression(value: string): string {
    if (!value) return '';
    let normalized = value.replace(/,/g, '').replace(/k/gi, '*1000').replace(/\s+/g, '');
    if (/^[0-9+\-*.]+$/.test(normalized)) {
        try {
            const result = new Function(`return ${normalized}`)();
            return result.toString();
        } catch (e) {
            return value;
        }
    }
    return value;
}

let dummyPhoneCounter = 1;

function generateUniqueDummyPhone(): string {
    const suffix = dummyPhoneCounter.toString().padStart(7, '0');
    dummyPhoneCounter++;
    return `080${suffix}`;
}

async function unifyData() {
    const csvFiles = await glob('legacy-data/*.csv');
    const sourceData: { file: string, rows: LegacyRow[], estateName: string }[] = [];
    const nameToPhoneMap: { [name: string]: string } = {};

    // 1. Preliminary Pass: Read all files into memory and map names to REAL phones
    for (const file of csvFiles) {
        if (file.endsWith('unified_legacy_data.csv') || file.endsWith('rejected_legacy_data.csv')) continue;

        const basename = path.basename(file, '.csv').split('_')[0].trim();
        const estateName = estateNameMap[basename] || basename;
        const csvContent = fs.readFileSync(file, 'utf8');
        const parsed = Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().toUpperCase()
        });

        const rows = parsed.data as LegacyRow[];
        sourceData.push({ file, rows, estateName });

        for (const row of rows) {
            const name = getMappedValue(row, 'CUSTOMER NAME').trim().toUpperCase();
            const phone = getMappedValue(row, 'PHONE NUMBER').trim();
            if (name && phone) {
                // Store the first real phone found for this name
                if (!nameToPhoneMap[name]) {
                    nameToPhoneMap[name] = phone;
                }
            }
        }
    }

    // 2. Stable Mapping: Assign a stable dummy phone to anyone who has NO real phone anywhere
    for (const { rows } of sourceData) {
        for (const row of rows) {
            const name = getMappedValue(row, 'CUSTOMER NAME').trim().toUpperCase();
            if (name && !nameToPhoneMap[name]) {
                nameToPhoneMap[name] = generateUniqueDummyPhone();
            }
        }
    }

    const allUnifiedRows: UnifiedRow[] = [];
    const rejectedRows: any[] = [];

    // 3. Final Pass: Unify using the stable mapping
    for (const { file, rows, estateName } of sourceData) {
        for (const row of rows) {
            const customerName = getMappedValue(row, 'CUSTOMER NAME');
            if (!customerName) {
                rejectedRows.push({ ...row, _source_file: file });
                continue;
            }

            const nameKey = customerName.trim().toUpperCase();
            const phone = nameToPhoneMap[nameKey];

            const unifiedRow: UnifiedRow = {
                'Date': getMappedValue(row, 'DATE'),
                'Customer Name': customerName,
                'Estate Name': estateName,
                'Email': null,
                'Phone Number': phone,
                'Address': getMappedValue(row, 'ADDRESS'),
                'Estate Code': getMappedValue(row, 'ESTATE CODE').toUpperCase(),
                'Plot No': getMappedValue(row, 'PLOT NO'),
                'Plot Size': getMappedValue(row, 'PLOT SIZE'),
                'Beacon No': getMappedValue(row, 'BEACON NO'),
                'Amount Paid (N)': parseMathExpression(getMappedValue(row, 'PAYMENT AMOUNT')),
                'Balance (N)': parseMathExpression(getMappedValue(row, 'BALANCE')),
                'Referral': getMappedValue(row, 'REFERRAL'),
                'Payment Status': getMappedValue(row, 'PLOT NO') ? 'approved' : 'draft',
            };

            allUnifiedRows.push(unifiedRow);
        }
    }

    const outputCsv = Papa.unparse(allUnifiedRows);
    fs.writeFileSync(OUTPUT_FILE, outputCsv);

    const rejectedCsv = Papa.unparse(rejectedRows);
    fs.writeFileSync(REJECTED_FILE, rejectedCsv);

    console.log(`Successfully created unified CSV at ${OUTPUT_FILE}`);
    console.log(`Successfully created rejected CSV at ${REJECTED_FILE}`);
    console.log(`Total records: ${allUnifiedRows.length}`);
    console.log(`Rejected records: ${rejectedRows.length}`);
}

unifyData().catch(err => {
    console.error('Failed to unify data:', err);
    process.exit(1);
});
