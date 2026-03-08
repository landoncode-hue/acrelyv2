import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

const VALID_ESTATES = [
    'Ose Perfection Garden',
    'Oduwa Housing Estate',
    'New Era of Wealth Estate',
    'Ehi Green Park Estate',
    'Success Palace Estate',
    'City of David Estate',
    'Soar High Estate',
    'Hectares of Diamond Estate',
    'The Wealthy Place Estate'
];

// Mapping from CSV estate names to DB estate names
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

interface ValidationResult {
    row: number;
    issues: string[];
    data: any;
}

function normalizeEstateName(name: string): string | null {
    const upper = name.trim().toUpperCase();
    return ESTATE_MAPPING[upper] || null;
}

function validatePhone(phone: string): boolean {
    if (!phone) return false;
    const cleaned = phone.replace(/[^0-9]/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
}

function parseAmount(val: string): number | null {
    if (!val || val === 'undefined' || val.trim() === '') return null;
    const cleaned = val.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

async function analyze() {
    const csvPath = path.resolve(__dirname, '../../legacy-data/unified_legacy_data.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const { data: records } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    console.log(`\n=== LEGACY DATA VALIDATION ===`);
    console.log(`Total records: ${records.length}\n`);

    const issues: ValidationResult[] = [];
    const estateStats: Record<string, number> = {};
    let validCount = 0;

    for (let i = 0; i < records.length; i++) {
        const row = records[i] as any;
        const rowNum = i + 2; // +2 for header and 1-indexing
        const rowIssues: string[] = [];

        // Customer Name
        if (!row['Customer Name']?.trim()) {
            rowIssues.push('Missing customer name');
        }

        // Phone
        if (!validatePhone(row['Phone No'])) {
            rowIssues.push(`Invalid phone: "${row['Phone No']}"`);
        }

        // Estate
        const estateName = row['Estate Name']?.trim();
        const mappedEstate = normalizeEstateName(estateName);
        if (!mappedEstate) {
            rowIssues.push(`Unknown estate: "${estateName}"`);
        } else {
            estateStats[mappedEstate] = (estateStats[mappedEstate] || 0) + 1;
        }

        // Amount/Balance - at least one should be valid
        const amountPaid = parseAmount(row['Amount Paid (N)']);
        const balance = parseAmount(row['Balance (N)']);
        if (amountPaid === null && balance === null) {
            rowIssues.push('No valid amount or balance');
        }

        if (rowIssues.length > 0) {
            issues.push({ row: rowNum, issues: rowIssues, data: row });
        } else {
            validCount++;
        }
    }

    // Summary
    console.log(`✅ Valid records: ${validCount}/${records.length}`);
    console.log(`❌ Records with issues: ${issues.length}\n`);

    console.log('=== ESTATE DISTRIBUTION ===');
    Object.entries(estateStats).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
        console.log(`  ${name}: ${count} records`);
    });

    if (issues.length > 0) {
        console.log('\n=== ISSUES (first 20) ===');
        issues.slice(0, 20).forEach(({ row, issues: iss, data }) => {
            console.log(`Row ${row}: ${data['Customer Name'] || '(no name)'}`);
            iss.forEach(i => console.log(`  - ${i}`));
        });

        if (issues.length > 20) {
            console.log(`\n... and ${issues.length - 20} more issues`);
        }
    }

    // Check if ready
    console.log('\n=== READINESS ===');
    if (issues.length === 0) {
        console.log('✅ All records are ready for import!');
    } else {
        console.log(`⚠️ ${issues.length} records need attention before import.`);
    }
}

analyze();
