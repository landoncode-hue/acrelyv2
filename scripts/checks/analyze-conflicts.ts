
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { glob } from 'glob';

// ---- REUSED LOGIC FROM IMPORT (Simplified) ----
interface LegacyRow {
    customer_name?: string;
    plot_number?: string;
    estate_name?: string;
    [key: string]: any;
}

const HEADER_MAPPINGS: Record<string, string[]> = {
    customer_name: ['CUSTOMER NAME', 'NAME', 'CLIENT NAME', 'FULL NAME', 'NAME OF CLIENT'],
    plot_number: ['PLOT NO', 'PLOT NUMBER', 'PLOT', 'BLOCK/PLOT'],
    estate_name: ['ESTATE NAME', 'ESTATE', 'PROJECT NAME'],
};

function normalizeHeader(header: string): string {
    return header.trim().toUpperCase();
}

function mapRow(row: any): LegacyRow {
    const mapped: LegacyRow = {};
    const rowKeys = Object.keys(row);

    for (const [targetField, possibleHeaders] of Object.entries(HEADER_MAPPINGS)) {
        for (const key of rowKeys) {
            if (possibleHeaders.includes(normalizeHeader(key))) {
                mapped[targetField as keyof LegacyRow] = row[key];
                break;
            }
        }
    }
    return mapped;
}

function parsePlots(rawPlot: string | undefined): string[] {
    if (!rawPlot || !rawPlot.trim()) return [];
    const str = rawPlot.trim().toUpperCase();

    // Size detection -> Ignore as Unassigned
    if (str.match(/^\d+[\/xX]\d+$/)) return [];
    if (str.includes('PLOT')) return []; // Bulk text

    const parts = str.split(/[,\&\/\\]+/).map(p => p.trim()).filter(p => p);
    const results: string[] = [];

    for (const part of parts) {
        const rangeMatch = part.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
            const start = parseInt(rangeMatch[1]);
            const end = parseInt(rangeMatch[2]);
            if (end >= start && (end - start) < 50) {
                for (let i = start; i <= end; i++) results.push(String(i));
            } else {
                results.push(part);
            }
        } else {
            results.push(part);
        }
    }
    return results;
}

// ---- MAIN ANALYSIS ----

async function main() {
    console.log("🔍 Starting Conflict Analysis on legacy_data/ ...");

    // Estate -> Plot -> Customers[]
    const conflictMap = new Map<string, Map<string, string[]>>();
    const files = await glob('legacy_data/*.csv'); // Ignore duplicates folder if it exists? The user mentioned duplication...

    // Note: We might want to check duplicates folder too if it was relevant, but let's stick to main legacy_data first to see "active" conflicts.
    // Actually, user said "legacy_data/SOAR HIGH ESTATE.csv" was duplicate of data.csv?
    // Let's just scan all .csv in legacy_data (non-recursive) to avoid `duplicates/` subfolder if it exists?
    // user path: legacy_data/duplicates/ ... glob 'legacy_data/*.csv' is non-recursive by default usually? 
    // fd glob is usually non recursive unless **.

    for (const file of files) {
        // Skip duplicate file if known
        if (file.includes('duplicates/')) continue;

        const defaultEstate = path.basename(file, '.csv').replace(/ESTATE/i, '').trim() + ' ESTATE';

        const rows: any[] = [];
        await new Promise<void>((resolve, reject) => {
            fs.createReadStream(file).pipe(csv()).on('data', d => rows.push(d)).on('end', () => resolve()).on('error', reject);
        });

        for (const rawRow of rows) {
            const row = mapRow(rawRow);
            const name = row.customer_name?.trim();
            if (!name) continue;

            const rawEstateName = (row.estate_name?.trim() && row.estate_name.length > 3) ? row.estate_name : defaultEstate;
            const estate = rawEstateName.toUpperCase().replace(/\s+ESTATE$/i, '').trim() + ' ESTATE';

            const plots = parsePlots(row.plot_number);

            if (!conflictMap.has(estate)) conflictMap.set(estate, new Map());
            const estatePlots = conflictMap.get(estate)!;

            for (const plot of plots) {
                if (!estatePlots.has(plot)) estatePlots.set(plot, []);
                // Add customer if not already listed for this plot (allow same customer multi-row claims? kind of a self-conflict but ignorable)
                const owners = estatePlots.get(plot)!;
                if (!owners.includes(name)) {
                    owners.push(name);
                }
            }
        }
    }

    // ---- REPORT ----
    console.log("\n⚠️  POTENTIAL CONFLICTS FOUND:");
    let conflictCount = 0;

    for (const [estate, plots] of conflictMap) {
        let estateHeaderPrinted = false;

        // Sort plots naturally
        const sortedPlots = Array.from(plots.keys()).sort((a, b) => {
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        for (const plot of sortedPlots) {
            const owners = plots.get(plot)!;
            if (owners.length > 1) {
                if (!estateHeaderPrinted) {
                    console.log(`\n📂 ${estate}:`);
                    estateHeaderPrinted = true;
                }
                console.log(`   🔸 Plot "${plot}" claimed by ${owners.length} people: ${owners.join(', ')}`);
                conflictCount++;
            }
        }
    }

    if (conflictCount === 0) {
        console.log("\n✅ No direct plot number conflicts found between different names.");
        console.log("   (Unassigned issues might be due to missing plot numbers or parsing failures)");
    } else {
        console.log(`\n❌ Found ${conflictCount} plot conflicts.`);
    }
}

main().catch(console.error);
