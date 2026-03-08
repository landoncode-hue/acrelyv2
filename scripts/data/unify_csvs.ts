import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import Papa from 'papaparse';

const LEGACY_DATA_DIR = path.join(process.cwd(), 'legacy-data');
const OUTPUT_FILE = path.join(LEGACY_DATA_DIR, 'unified_legacy_data.csv');

// Desired Headers
const HEADERS = [
    'Date',
    'Customer Name',
    'Plot No',
    'Amount Paid (N)',
    'Balance (N)',
    'Phone Number',
    'Address',
    'Referral',
    'Estate Name',
    'Plot Size',
    'Email'
];

async function unifyLegacyData() {
    console.log('🚀 Starting Legacy CSV Unification...');

    if (!fs.existsSync(LEGACY_DATA_DIR)) {
        console.error(`❌ Legacy data directory not found: ${LEGACY_DATA_DIR}`);
        return;
    }

    const files = fs.readdirSync(LEGACY_DATA_DIR).filter(f => f.endsWith('.csv') && f !== 'unified_legacy_data.csv');
    console.log(`Found ${files.length} files to process.`);

    let allRecords: any[] = [];
    let dummyPhoneCounter = 1;
    const generatedEmails = new Set<string>();

    // Helper to generate unique email
    const generateEmail = (name: string): string => {
        if (!name || name.trim() === '') return `unknown.user${Date.now()}@pinnaclegroups.ng`;

        const parts = name.trim().toLowerCase().split(/\s+/).map(p => p.replace(/[^a-z0-9]/g, ''));
        let email = '';

        if (parts.length === 1) {
            email = `${parts[0]}@pinnaclegroups.ng`;
        } else {
            const first = parts[0];
            const last = parts[parts.length - 1];
            email = `${first}.${last}@pinnaclegroups.ng`;
        }

        // Ensure uniqueness
        if (generatedEmails.has(email)) {
            let counter = 1;
            let originalEmail = email;
            while (generatedEmails.has(email)) {
                email = originalEmail.replace('@', `${counter}@`);
                counter++;
            }
        }

        generatedEmails.add(email);
        return email;
    };

    // Helper to evaluate money expressions like "1200000+240K"
    const parseMoneyExpression = (value: string): string => {
        if (!value || value.trim() === '') return '';

        // If it's a word like REFUNDED, return as is
        if (!/\d/.test(value)) return value;

        // Clean and Normalize - Replace K with 000, M with 000000
        let processed = value.toUpperCase()
            .replace(/,/g, '') // remove commas first
            .replace(/(\d)\s*K/g, '$1000')
            .replace(/(\d)\s*M/g, '$1000000');

        // Handle addition
        if (processed.includes('+')) {
            const parts = processed.split('+');
            let sum = 0;
            for (const part of parts) {
                const num = parseFloat(part.replace(/[^0-9.-]/g, ''));
                if (!isNaN(num)) sum += num;
            }
            return sum.toString();
        }

        // If just a number with formatting
        const simplified = processed.replace(/[^0-9.-]/g, '');
        if (simplified === '') return value;

        return simplified;
    };

    // Helper to standardize date to YYYY-MM-DD format
    const standardizeDate = (dateStr: string): string => {
        if (!dateStr || dateStr.trim() === '') return '2025-01-01';

        const trimmed = dateStr.trim();

        // Try to parse various formats
        try {
            // Handle formats like "9-Jan-25", "17-Mar-25"
            const dashMonthMatch = trimmed.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/);
            if (dashMonthMatch) {
                const day = dashMonthMatch[1].padStart(2, '0');
                const monthStr = dashMonthMatch[2].toLowerCase();
                const year = `20${dashMonthMatch[3]}`;
                const monthMap: Record<string, string> = {
                    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
                    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
                    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
                };
                const month = monthMap[monthStr] || '01';
                return `${year}-${month}-${day}`;
            }

            // Handle formats like "7/30/2024", "1/1/2025"
            const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (slashMatch) {
                const month = slashMatch[1].padStart(2, '0');
                const day = slashMatch[2].padStart(2, '0');
                const year = slashMatch[3];
                return `${year}-${month}-${day}`;
            }

            // Handle formats like "23/10/2024" (DD/MM/YYYY)
            const ddmmyyyyMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
            if (ddmmyyyyMatch) {
                const day = ddmmyyyyMatch[1];
                const month = ddmmyyyyMatch[2];
                const year = ddmmyyyyMatch[3];
                return `${year}-${month}-${day}`;
            }

            // Handle formats like "8/1/2025"
            const shortSlashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (shortSlashMatch) {
                const first = parseInt(shortSlashMatch[1]);
                const second = parseInt(shortSlashMatch[2]);
                const year = shortSlashMatch[3];

                // Assume M/D/YYYY if first part > 12, otherwise D/M/YYYY
                if (first > 12) {
                    const day = first.toString().padStart(2, '0');
                    const month = second.toString().padStart(2, '0');
                    return `${year}-${month}-${day}`;
                } else {
                    const month = first.toString().padStart(2, '0');
                    const day = second.toString().padStart(2, '0');
                    return `${year}-${month}-${day}`;
                }
            }
        } catch (error) {
            console.warn(`Failed to parse date: ${dateStr}`);
        }

        return '2025-01-01'; // Fallback
    };

    for (const file of files) {
        console.log(`Processing: ${file}`);
        const filePath = path.join(LEGACY_DATA_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Extract Estate Name from filename
        const estateName = file.replace(/_\d+\.csv$/, '')
            .replace(/\.csv$/, '');

        try {
            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                bom: true,
                relax_quotes: true,
                relax_column_count: true
            });

            const mappedRecords = records.map((record: any) => {
                let phoneNumber = record['PHONE NO'] || record['Phone Number'] || '';

                // Generate fake unique phone number if missing
                if (!phoneNumber || phoneNumber.trim() === '') {
                    phoneNumber = `099${String(dummyPhoneCounter++).padStart(8, '0')}`;
                }

                // Email generation
                let email = record['Email'] || record['EMAIL'] || '';
                if (!email || email.trim() === '') {
                    const customerName = record['CUSTOMER NAME'] || record['Customer Name'] || '';
                    email = generateEmail(customerName);
                }

                // Map columns dynamically
                const balance = record['BALANCE'] || record['Balance'] || '';
                const payment = record['PAYMENT'] || record['Amount Paid'] || '';
                const date = record['DATE'] || record['Date'] || '';

                return {
                    'Date': standardizeDate(date),
                    'Customer Name': record['CUSTOMER NAME'] || record['Customer Name'] || '',
                    'Plot No': record['PLOT NO'] || record['Plot No'] || '',
                    'Amount Paid (N)': parseMoneyExpression(payment),
                    'Balance (N)': (!balance || balance.trim() === '') ? '0' : parseMoneyExpression(balance),
                    'Phone Number': phoneNumber,
                    'Address': (record['ADDRESS'] || record['Address'] || '').trim() || 'No 1, Default Street, Benin City',
                    'Referral': (record['REFERRED BY'] || record['Referred By'] || '').trim() || 'null',
                    'Estate Name': estateName,
                    'Plot Size': record['PLOT SIZE'] || record['Plot Size'] || '',
                    'Email': email
                };
            });

            allRecords = [...allRecords, ...mappedRecords];
        } catch (err: any) {
            console.error(`❌ Error parsing ${file}:`, err.message);
        }
    }

    console.log(`Total records collected: ${allRecords.length}`);

    const output = Papa.unparse({
        fields: HEADERS,
        data: allRecords
    });

    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`✅ Successfully wrote unified data to: ${OUTPUT_FILE}`);
}

unifyLegacyData();
