
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { glob } from 'glob';

interface RowAnomaly {
    file: string;
    line: number;
    customer: string;
    type: 'CONFLICT' | 'COLUMN_SWAP' | 'INVALID_DATE' | 'MISSING_DATA' | 'SUSPICIOUS_PLOT';
    details: string;
}

const HEADER_MAPPINGS: Record<string, string[]> = {
    customer_name: ['CUSTOMER NAME', 'NAME', 'CLIENT NAME', 'FULL NAME', 'NAME OF CLIENT'],
    plot_number: ['PLOT NO', 'PLOT NUMBER', 'PLOT', 'BLOCK/PLOT'],
    plot_size: ['PLOT SIZE', 'SIZE', 'DIMENSION', 'SQM'],
    estate_name: ['ESTATE NAME', 'ESTATE', 'PROJECT NAME'],
    date: ['DATE', 'DATE OF PAYMENT'],
};

function normalizeHeader(header: string): string {
    return header.trim().toUpperCase();
}

function mapRow(row: any) {
    const mapped: any = {};
    const rowKeys = Object.keys(row);

    for (const [targetField, possibleHeaders] of Object.entries(HEADER_MAPPINGS)) {
        for (const key of rowKeys) {
            if (possibleHeaders.includes(normalizeHeader(key))) {
                mapped[targetField] = row[key];
                break;
            }
        }
    }
    // Keep raw row for strict checking
    mapped._raw = row;
    return mapped;
}

function isSizeFormat(val: string): boolean {
    if (!val) return false;
    // Matches 100/100, 50x100, 100\100, 300sqm, etc.
    return /^\d+[\/xX\\]\d+/.test(val) || /\d+\s*(sqm|ft)/i.test(val);
}

function isPlotFormat(val: string): boolean {
    if (!val) return false;
    // Matches 1, 1A, 1-5, 20 & 21
    // Should NOT match 100/100
    if (isSizeFormat(val)) return false;
    return /^[\w\d\s&\-\.,]+$/.test(val);
}

async function main() {
    console.log("🔍 Starting Comprehensive Data Analysis...\n");
    const files = await glob('legacy_data/*.csv');
    const anomalies: RowAnomaly[] = [];

    // Estate -> Plot -> Customers[]
    const claimMap = new Map<string, Map<string, string[]>>();

    for (const file of files) {
        if (file.includes('duplicates')) continue;
        const fileName = path.basename(file);
        const defaultEstate = fileName.replace('.csv', '').replace(/ESTATE/i, '').trim() + ' ESTATE';

        const rows: any[] = [];
        await new Promise<void>((resolve, reject) => {
            fs.createReadStream(file)
                .pipe(csv())
                .on('data', d => rows.push(d))
                .on('end', resolve)
                .on('error', reject);
        });

        rows.forEach((rawRow, index) => {
            const line = index + 2; // 1-based + header
            const row = mapRow(rawRow);
            const name = row.customer_name?.trim() || 'Unknown';

            // 1. Missing Critical Data
            if (!row.customer_name) {
                anomalies.push({
                    file: fileName, line, customer: 'Unknown', type: 'MISSING_DATA',
                    details: 'Row has no Customer Name'
                });
                return;
            }

            // 2. Column Swap Detection
            const plotRaw = row.plot_number?.trim();
            const sizeRaw = row.plot_size?.trim();

            if (plotRaw && isSizeFormat(plotRaw) && sizeRaw && !isSizeFormat(sizeRaw)) {
                anomalies.push({
                    file: fileName, line, customer: name, type: 'COLUMN_SWAP',
                    details: `Plot Column has Size format "${plotRaw}", Size Column has Plot format "${sizeRaw}"`
                });
            }

            // 3. Suspicious Plot Numbers (Empty or weird)
            if (!plotRaw) {
                // Not necessarily an error if bulk, but worth noting?
                // anomalies.push({ file: fileName, line, customer: name, type: 'MISSING_DATA', details: 'No Plot Number identified' });
            }

            // 4. Conflict Mapping
            // Use the "corrected" plot number if swapped, otherwise raw
            let effectivePlot = plotRaw;
            if (plotRaw && isSizeFormat(plotRaw) && sizeRaw && !isSizeFormat(sizeRaw)) {
                effectivePlot = sizeRaw;
            }

            if (effectivePlot) {
                const estate = (row.estate_name || defaultEstate).toUpperCase().trim();

                // Parse simple
                // This is a naive split, mirroring the import logic roughly
                const parts = effectivePlot.toUpperCase().split(/[,\&\/\\]+/).map((p: string) => p.trim()).filter((p: string) => p);

                parts.forEach((p: string) => {
                    // Ignore obvious size strings in split parts
                    if (isSizeFormat(p)) return;
                    if (p.includes('PLOT')) return; // Bulk text

                    if (!claimMap.has(estate)) claimMap.set(estate, new Map());
                    const estatePlots = claimMap.get(estate)!;

                    if (!estatePlots.has(p)) estatePlots.set(p, []);
                    const owners = estatePlots.get(p)!;
                    if (!owners.includes(name)) owners.push(name);
                });
            }
        });
    }

    // Process Claims for Conflicts
    for (const [estate, plots] of claimMap) {
        for (const [plot, owners] of plots) {
            if (owners.length > 1) {
                // Filter out likely false positives? 
                // Detection logic: if names are very similar? (Levenshtein?) - Out of scope for now.
                // Just report.
                anomalies.push({
                    file: 'MULTIPLE_FILES', line: 0, customer: owners.join(', '),
                    type: 'CONFLICT',
                    details: `Estate: ${estate}, Plot: ${plot} claimed by multiple people.`
                });
            }
        }
    }

    // Print Report
    console.log(`Found ${anomalies.length} total anomalies.\n`);

    const grouped = anomalies.reduce((acc, a) => {
        if (!acc[a.type]) acc[a.type] = [];
        acc[a.type].push(a);
        return acc;
    }, {} as Record<string, RowAnomaly[]>);

    if (grouped['COLUMN_SWAP']) {
        console.log(`🔄 COLUMN SWAPS DETECTED (${grouped['COLUMN_SWAP'].length}):`);
        console.log(`   (Likely "Plot Number" and "Plot Size" columns swapped in CSV)`);
        grouped['COLUMN_SWAP'].forEach(a => {
            console.log(`   - ${a.file}:${a.line} [${a.customer}] -> ${a.details}`);
        });
        console.log('');
    }

    if (grouped['CONFLICT']) {
        console.log(`⚔️  PLOT CONFLICTS (${grouped['CONFLICT'].length}):`);
        console.log(`   (Same plot number claimed by different names)`);
        grouped['CONFLICT'].forEach(a => {
            console.log(`   - ${a.details} (Owners: ${a.customer})`);
        });
        console.log('');
    }

    if (grouped['MISSING_DATA']) {
        console.log(`❓ MISSING DATA (${grouped['MISSING_DATA'].length}):`);
        grouped['MISSING_DATA'].forEach(a => {
            console.log(`   - ${a.file}:${a.line} -> ${a.details}`);
        });
    }
}

main().catch(console.error);
