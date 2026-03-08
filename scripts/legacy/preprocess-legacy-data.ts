
import * as fs from 'fs';
import * as path from 'path';
import * as Papa from 'papaparse';

const ORIGINAL_CSV = path.resolve('legacy-data/unified_legacy_data.csv');
const SANITIZED_CSV = path.resolve('legacy-data/sanitized_legacy_data.csv');

const estateMapping: Record<string, string> = {
    'NEW ERA ESTATE': 'New Era of Wealth Estate',
    'GOG GARDEN ESTATE': 'The Wealthy Place Estate',
    'SUCCESS PALACE ESTATE': 'Success Palace Estate',
    'CITY OF DAVID ESTATE': 'City of David Estate',
    'HECTARES OF DIAMOND ESTATE': 'Hectares of Diamond Estate',
    'EHI GREEN PARK ESTATE': 'Ehi Green Park Estate',
    'SOAR HIGH ESTATE': 'Soar High Estate',
    'OSE PERFECTION GARDEN': 'Ose Perfection Garden',
    'ODUWA HOUSING ESTATE': 'Oduwa Housing Estate'
};

function parseNaira(val: any): string {
    if (!val || val === 'undefined' || val === 'N/A' || val.trim() === '') return '0';
    // Remove symbols and commas
    return val.toString().replace(/[₦,]/g, '').trim();
}

function processPlots(plotNo: string): { plot_number: string, is_half: boolean, designation: string } {
    let plot_number = plotNo?.trim() || '';
    let is_half = false;
    let designation = '';

    // Handle standard A/B suffixes (e.g., 6A, 6B, 18a)
    const suffixMatch = plot_number.match(/^(\d+)([a-zA-Z])$/i);
    if (suffixMatch) {
        plot_number = suffixMatch[1];
        const letter = suffixMatch[2].toUpperCase();
        if (letter === 'A' || letter === 'B') {
            is_half = true;
            designation = letter;
        }
    }

    // Standardize plot number to PLOT-000 format if it is purely numeric
    if (/^\d+$/.test(plot_number)) {
        plot_number = `PLOT-${plot_number.padStart(3, '0')}`;
    }

    return { plot_number, is_half, designation };
}

async function preprocess() {
    console.log('🚀 Starting legacy data sanitization...');

    if (!fs.existsSync(ORIGINAL_CSV)) {
        console.error('❌ Original CSV not found!');
        return;
    }

    const csvContent = fs.readFileSync(ORIGINAL_CSV, 'utf8');
    const { data: records } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    const sanitizedRecords = (records as any[]).map((row, index) => {
        const rawEstate = row['Estate Name']?.trim() || '';
        const systemEstate = estateMapping[rawEstate.toUpperCase()] || rawEstate;

        const { plot_number, is_half, designation } = processPlots(row['Plot No']);

        return {
            'Customer Name': row['Customer Name']?.trim().toUpperCase(),
            'Original Estate': rawEstate,
            'Sanitized Estate': systemEstate,
            'Original Plot': row['Plot No'],
            'Plot Number': plot_number,
            'Is Half Plot': is_half ? 'YES' : 'NO',
            'Half Plot Designation': designation,
            'Amount Paid (N)': parseNaira(row['Amount Paid (N)']),
            'Balance (N)': parseNaira(row['Balance (N)']),
            'Phone No': row['Phone No']?.trim() || '00000000000',
            'Payment Date (D/M/Y)': row['Payment Date (D/M/Y)']?.trim(),
            'Email': row['Email']?.trim() || ''
        };
    });

    const csvOutput = Papa.unparse(sanitizedRecords);
    fs.writeFileSync(SANITIZED_CSV, csvOutput);

    console.log(`✅ Sanitization complete! ${sanitizedRecords.length} records saved to ${SANITIZED_CSV}`);
}

preprocess();
