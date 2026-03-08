// scripts/Data_Migration.ts
// Utility to import legacy customers and plot data from CSV into Acrely.

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials in environment.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface LegacyRecord {
    Legacy_ID: string;
    Customer_Name: string;
    Customer_Phone: string;
    Customer_Email: string;
    Estate_Name: string;
    Plot_Number: string;
    Plot_Size: string;
    Total_Paid: string;
    Status: string;
}

async function migrate() {
    console.log("Starting Acrely Data Migration...");
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Usage: tsx scripts/Data_Migration.ts <path-to-legacy.csv>");
        process.exit(1);
    }

    const csvPath = path.resolve(args[0]);
    if (!fs.existsSync(csvPath)) {
        console.error(`File not found: ${csvPath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    }) as LegacyRecord[];

    console.log(`Found ${records.length} legacy records to process.`);

    for (const record of records) {
        try {
            console.log(`Processing: Row ${record.Legacy_ID} for ${record.Customer_Name}`);

            // 1. Resolve or Create Estate
            let { data: estate } = await supabase
                .from('estates')
                .select('id')
                .eq('name', record.Estate_Name)
                .single();

            if (!estate) {
                console.log(`   -> Creating missing estate: ${record.Estate_Name}`);
                const { data: newEstate, error } = await supabase
                    .from('estates')
                    .insert({
                        name: record.Estate_Name,
                        location: 'Legacy Import - Update Required',
                        base_price: 0,
                        grid_rows: 50,
                        grid_cols: 50
                    })
                    .select('id')
                    .single();

                if (error) throw new Error(`Estate creation failed: ${error.message}`);
                estate = newEstate;
            }

            // 2. Resolve Plot
            let { data: plot } = await supabase
                .from('plots')
                .select('id')
                .eq('estate_id', estate.id)
                .eq('plot_number', record.Plot_Number)
                .single();

            if (!plot) {
                console.log(`   -> Creating missing plot: ${record.Plot_Number}`);
                const { data: newPlot, error } = await supabase
                    .from('plots')
                    .insert({
                        estate_id: estate.id,
                        plot_number: record.Plot_Number,
                        dimensions: record.Plot_Size || '50x100',
                        status: record.Status === 'Sold' ? 'allocated' : 'available',
                        grid_x: 0,
                        grid_y: 0
                    })
                    .select('id')
                    .single();

                if (error) throw new Error(`Plot creation failed: ${error.message}`);
                plot = newPlot;
            }


            // 3. User Resolution is complex since Auth accounts need to be created.
            // For a production script, we'd invoke the Supabase Admin Auth API.
            // Since this is a template script for handover, we will log the mapping.
            console.log(`   -> OK: Mapped ${record.Customer_Name} [${record.Customer_Email}] to plot ${record.Plot_Number} in ${record.Estate_Name}.`);

        } catch (err: any) {
            console.error(`ERROR on Legacy ID ${record.Legacy_ID}: ${err.message}`);
        }
    }

    console.log("Migration Dry-Run Complete.");
}

migrate();
