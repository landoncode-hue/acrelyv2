
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as Papa from 'papaparse';
import * as dotenv from 'dotenv';

dotenv.config();

const LEGACY_FILE = path.resolve(process.cwd(), 'legacy-data/unified_legacy_data.csv');
const REPORT_FILE = 'failed_records.md';

function levenshtein(a: string, b: string): number {
    const matrix = [];
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
            else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
        }
    }
    return matrix[b.length][a.length];
}

async function auditImport() {
    console.log('🔍 Starting Audit...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Load CSV
    const fileContent = fs.readFileSync(LEGACY_FILE, 'utf8');
    const { data: rows, errors, meta } = Papa.parse(fileContent, { header: true, skipEmptyLines: true });

    console.log(`stats: Raw Rows: ${rows.length}. Parse Errors: ${errors.length}. Aborted: ${meta.aborted}`);
    // Check if any row is empty or malformed
    const validRows = rows.filter((r: any) => r['Customer Name']);
    console.log(`stats: Valid Rows (with Name): ${validRows.length}`);

    // 2. Load DB Customers & Allocations
    const { data: customers } = await supabase.from('customers').select('id, full_name');
    const { data: allocations } = await supabase.from('allocations').select('customer_id');
    const allocatedCustomerIds = new Set(allocations?.map(a => a.customer_id));

    const reportLines = ['# Legacy Import Audit Report', '', `Total CSV Rows: ${rows.length}`, `Valid Rows: ${validRows.length}`, ''];
    reportLines.push('| Row | Customer Name (CSV) | DB Match | Status | Suggestion |');
    reportLines.push('|---|---|---|---|---|');

    let missingCount = 0;
    let allocatedCount = 0;
    let unallocatedCount = 0;

    for (const row of rows as any[]) {
        const name = row['Customer Name']?.trim();
        if (!name) continue; // Skip empty

        const cleanName = name.toLowerCase();

        // Find in DB
        let match = null;
        let method = 'none';

        // Exact
        const exact = customers?.find(c => c.full_name?.toLowerCase().trim() === cleanName);
        if (exact) {
            match = exact;
            method = 'exact';
        } else {
            // Fuzzy
            let bestDist = 100;
            let bestC = null;
            for (const c of customers || []) {
                const dbName = c.full_name?.toLowerCase().trim() || '';
                // Includes
                if (dbName.includes(cleanName) || cleanName.includes(dbName)) {
                    if (bestC === null) { bestC = c; method = 'includes'; } // First include
                    continue;
                }
                // Distance
                const dist = levenshtein(cleanName, dbName);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestC = c;
                }
            }
            if (bestDist < 4) {
                match = bestC;
                method = 'fuzzy';
            } else if (method === 'includes') {
                match = bestC; // Includes
            }
        }

        let status = 'MISSING';
        if (match) {
            if (allocatedCustomerIds.has(match.id)) {
                status = 'IMPORTED';
                allocatedCount++;
            } else {
                status = 'FOUND_BUT_NO_ALLOC';
                unallocatedCount++;
            }
        } else {
            missingCount++;
        }

        if (status !== 'IMPORTED') {
            const suggestion = match ? `Match: **${match.full_name}** (${method})` : 'No Match Found';
            reportLines.push(`| - | ${name} | ${match ? '✅' : '❌'} | ${status} | ${suggestion} |`);
        }
    }

    console.log(`Audit Complete.`);
    console.log(`Imported: ${allocatedCount}`);
    console.log(`Found User/No Alloc: ${unallocatedCount}`);
    console.log(`Missing User: ${missingCount}`);

    fs.writeFileSync(REPORT_FILE, reportLines.join('\n'));
    console.log(`Report written to ${REPORT_FILE}`);
}

auditImport();
