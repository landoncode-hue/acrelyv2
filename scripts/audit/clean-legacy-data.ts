import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

const ESTATE_MAPPING: Record<string, string> = {
    'CITY OF DAVID ESTATE': 'City of David Estate',
    'EHI GREEN PARK ESTATE': 'Ehi Green Park Estate',
    'HECTARES OF DIAMOND ESTATE': 'Hectares of Diamond Estate',
    'NEW ERA ESTATE': 'New Era of Wealth Estate',
    'ODUWA HOUSING ESTATE': 'Oduwa Housing Estate',
    'OSE PERFECTION GARDEN': 'Ose Perfection Garden',
    'SOAR HIGH ESTATE': 'Soar High Estate',
    'SUCCESS PALACE ESTATE': 'Success Palace Estate',
    'WEALTHY PLACE ESTATE': 'The Wealthy Place Estate',
};

function validatePhone(phone: string): boolean {
    if (!phone) return false;
    const cleaned = phone.replace(/[^0-9]/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
}

function normalizePhone(phone: string): string {
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length === 10 && !cleaned.startsWith('0')) {
        cleaned = '0' + cleaned;
    }
    return cleaned;
}

async function cleanData() {
    const csvPath = path.resolve(__dirname, '../../legacy-data/unified_legacy_data.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const { data: records } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    console.log(`Processing ${records.length} records...\n`);

    const usedPhones = new Set<string>();
    let placeholderIndex = 1;
    let fixedPhones = 0;
    let fixedAmounts = 0;

    const cleanedRecords = records.map((row: any, i: number) => {
        const cleaned = { ...row };

        // Fix phone
        let phone = row['Phone No']?.toString().trim() || '';
        if (!validatePhone(phone)) {
            // Generate unique placeholder
            phone = `08000000${String(placeholderIndex++).padStart(3, '0')}`;
            fixedPhones++;
        } else {
            phone = normalizePhone(phone);
        }
        // Ensure uniqueness
        while (usedPhones.has(phone)) {
            phone = `08000000${String(placeholderIndex++).padStart(3, '0')}`;
        }
        usedPhones.add(phone);
        cleaned['Phone No'] = phone;

        // Fix estate name
        const estateName = row['Estate Name']?.trim().toUpperCase();
        cleaned['Estate Name'] = ESTATE_MAPPING[estateName] || row['Estate Name'];

        // Fix amounts - records with no payment get 0 amount
        let amount = row['Amount Paid (N)']?.toString().trim();
        if (!amount || amount === 'undefined' || amount === '') {
            cleaned['Amount Paid (N)'] = '0';
            fixedAmounts++;
        }

        let balance = row['Balance (N)']?.toString().trim();
        if (!balance || balance === 'undefined' || balance === '') {
            cleaned['Balance (N)'] = '0';
        }

        return cleaned;
    });

    // Write cleaned CSV
    const outputPath = path.resolve(__dirname, '../../legacy-data/unified_legacy_data_cleaned.csv');
    const csv = Papa.unparse(cleanedRecords);
    fs.writeFileSync(outputPath, csv);

    console.log(`✅ Cleaned CSV saved to: legacy-data/unified_legacy_data_cleaned.csv`);
    console.log(`   - Fixed ${fixedPhones} invalid phone numbers`);
    console.log(`   - Set ${fixedAmounts} missing amounts to 0`);
    console.log(`   - Total records: ${cleanedRecords.length}`);
}

cleanData();
