import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const LEGACY_DIR = path.join(process.cwd(), 'legacy_data');

async function main() {
    console.log('Starting Legacy vs Database Verification...\n');

    // 1. Get all files
    const files = fs.readdirSync(LEGACY_DIR).filter(f => f.endsWith('.csv'));

    for (const file of files) {
        const estateNameRaw = file.replace('.csv', '').trim();
        const filePath = path.join(LEGACY_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // 2. Parse CSV
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        // Filter valid rows (must have a plot number or customer name to count as a record)
        const validRows = records.filter((r: any) => r['PLOT NO'] || r['CUSTOMER NAME']);
        const rowsWithPlot = records.filter((r: any) => r['PLOT NO']);

        console.log(`\n----------------------------------------`);
        console.log(`Checking: ${estateNameRaw}`);
        console.log(`  CSV Total Rows: ${records.length}`);
        console.log(`  CSV Valid Rows (with Name/Plot): ${validRows.length}`);
        console.log(`  CSV Rows with Plot Number: ${rowsWithPlot.length}`);

        // 3. Find Estate in DB
        // Fuzzy match: Take first 2 words
        const searchName = estateNameRaw.split(' ').slice(0, 2).join(' ');

        // DEDUPLICATION:
        // Many legacy rows are multiple payments for the same plot.
        // We should compare UNIQUE plot numbers.
        const uniquePlots = new Set(rowsWithPlot.map((r: any) => r['PLOT NO'].trim().toUpperCase()));
        console.log(`  CSV Unique Plots: ${uniquePlots.size} (Raw rows: ${rowsWithPlot.length})`);


        const { data: estates } = await supabase
            .from('estates')
            .select('*')
            .ilike('name', `%${searchName}%`);

        if (!estates || estates.length === 0) {
            console.error(`  ❌ ERROR: Estate not found in DB for '${searchName}'`);
            continue;
        }

        // Pick best match (assuming unique or merged)
        // If multiple, log all
        if (estates.length > 1) {
            console.warn(`  ⚠️ Warning: Found ${estates.length} matching estates. Using first one.`);
        }

        const estate = estates[0];
        console.log(`  Matched DB Estate: ${estate.name} (ID: ${estate.id})`);
        console.log(`  DB Occupied Plots: ${estate.occupied_plots}`);
        console.log(`  DB Total Plots: ${estate.total_plots}`);

        // 4. Compare
        // We compare 'Rows with Plot Number' vs 'Occupied Plots'
        // Note: Some legacy rows might be payment plans without plot numbers (pending), or duplicate entries for same plot?
        // Let's check allocations count too.

        const { count: allocationCount } = await supabase
            .from('allocations')
            .select('*', { count: 'exact', head: true })
            .eq('estate_id', estate.id);

        console.log(`  DB Allocations Count: ${allocationCount}`);

        const diff = Math.abs(allocationCount! - uniquePlots.size);
        if (diff === 0) {
            console.log(`  ✅ EXACT MATCH: CSV Unique Plots (${uniquePlots.size}) == DB Allocations (${allocationCount})`);
        } else {
            console.log(`  ❌ MISMATCH: Diff of ${diff}.`);
            console.log(`     CSV expects ${uniquePlots.size} unique plots, DB has ${allocationCount}.`);

            if (uniquePlots.size > allocationCount!) {
                console.log(`     Possible cause: Some plots didn't import.`);

                // DETAILED ANALYSIS: Find which plots are missing
                const { data: dbPlots } = await supabase
                    .from('plots')
                    .select('plot_number')
                    .eq('estate_id', estate.id);

                const dbPlotSet = new Set(dbPlots?.map(p => p.plot_number.trim().toUpperCase()));
                const missingPlots = [...uniquePlots].filter(p => !dbPlotSet.has(p));

                console.log(`     Missing Plots (${missingPlots.length}): ${missingPlots.join(', ')}`);

                if (missingPlots.length > 0) {
                    // Show sample row for first missing plot
                    const sampleMissing = rowsWithPlot.find((r: any) => r['PLOT NO'].trim().toUpperCase() === missingPlots[0]);
                    console.log(`     Sample Row for missing plot '${missingPlots[0]}':`);
                    console.log(JSON.stringify(sampleMissing, null, 2));
                }
            } else {
                console.log(`     Possible cause: Manual additions or duplicate DB records?`);
            }
        }
    }
}

main();
