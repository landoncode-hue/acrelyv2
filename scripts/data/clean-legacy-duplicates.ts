
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as Papa from 'papaparse';
import * as dotenv from 'dotenv';
// import { createAllocationCore } from '../../src/lib/actions/allocation-actions';

dotenv.config();

const LEGACY_FILE = path.resolve(process.cwd(), 'legacy-data/unified_legacy_data.csv');

async function cleanDuplicates() {
    console.log('🧹 Starting Duplicate Cleanup...');

    // Init Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load CSV
    const fileContent = fs.readFileSync(LEGACY_FILE, 'utf8');
    const { data: rows } = Papa.parse(fileContent, { header: true, skipEmptyLines: true });

    // Map CSV Expectations: CustomerName -> [PlotNames]
    const csvMap = new Map<string, string[]>();

    for (const row of rows as any[]) {
        const name = row['Customer Name']?.trim().toLowerCase();
        if (!name) continue;
        const plot = row['Plot No']?.trim();
        if (!plot) continue;

        if (!csvMap.has(name)) csvMap.set(name, []);
        csvMap.get(name)?.push(plot);
    }

    // Fetch DB Allocations (Legacy ones ideally, but all "Draft" or all?)
    // We should filter by check: "Are there multiple allocations for same plot ID for same customer?"

    // 1. Fetch all allocations with plot info
    // 1. Fetch all allocations with plot info
    console.log("Fetching allocations from DB...");
    const { data: allocations, error } = await supabase
        .from('allocations')
        .select(`
            id, customer_id, plot_id, plot_half, customer_facing_name, created_at,
            customers (full_name),
            plots:plots!allocations_plot_id_fkey (plot_number, estate_id)
        `)
        .eq('status', 'draft');

    if (error) {
        console.error("❌ DB Error:", error);
        return;
    }

    if (!allocations || allocations.length === 0) {
        console.log("No allocations found.");
        return;
    }

    console.log(`Analyzing ${allocations.length} allocations...`);

    let deleted = 0;

    // Group by Customer
    const allocsByCustomer = new Map();
    allocations.forEach((a: any) => {
        // customers might be array or object depending on relation
        const customer = Array.isArray(a.customers) ? a.customers[0] : a.customers;
        const cName = customer?.full_name?.trim().toLowerCase();
        if (!cName) return;
        if (!allocsByCustomer.has(cName)) allocsByCustomer.set(cName, []);
        allocsByCustomer.get(cName).push(a);
    });

    for (const [cName, userAllocs] of allocsByCustomer.entries()) {
        const expectedPlots = csvMap.get(cName);
        if (!expectedPlots) {
            // Customer not in CSV? Maybe manual allocation? Skip.
            continue;
        }

        // Check for duplicates on SAME Plot ID
        // Group userAllocs by plot_id
        const byPlotId = new Map();
        userAllocs.forEach((a: any) => {
            if (!a.plot_id) return;
            if (!byPlotId.has(a.plot_id)) byPlotId.set(a.plot_id, []);
            byPlotId.get(a.plot_id).push(a);
        });

        for (const [plotId, list] of byPlotId.entries()) {
            if (list.length > 1) {
                // Customer has multiple allocations on this plot.
                // E.g. 4A and 4B.
                // Check CSV. Does CSV have 2 entries for this plot?
                // CSV Plot Names for this customer:
                const csvPlots = expectedPlots;
                // We need to match CSV plot names to this plotId.
                // This is hard without Estate context.
                // But we can check if the list matches expected count.

                // Heuristic: If CSV has 1 entry for "4A", but DB has "4A" and "4B".
                // We keep "4A" (matching CSV) and delete "4B".

                // Get CSV plot names that "match" this plot number (e.g. "4", "4A", "4B")
                // Assuming `list[0].plots.plot_number` is "4".
                const baseNum = list[0].plots?.plot_number;

                const relevantCsvEntries = csvPlots.filter(p => p.startsWith(baseNum)); // Weak match

                if (relevantCsvEntries.length < list.length) {
                    // We have MORE DB allocations than CSV entries.
                    console.log(`⚠️  Duplicate detected for ${cName} on Plot ${baseNum}. DB: ${list.length}, CSV: ${relevantCsvEntries.length}`);

                    // Identify which to delete using strictly `customer_facing_name` vs CSV `Plot No`
                    const toKeep = [];
                    const toDelete = [];

                    const matchedCsv = new Set();

                    // First pass: Match exact names
                    for (const alloc of list) {
                        const dbName = alloc.customer_facing_name;
                        // Find matching CSV entry
                        const match = relevantCsvEntries.find(csvP => csvP === dbName && !matchedCsv.has(csvP));
                        if (match) {
                            toKeep.push(alloc);
                            matchedCsv.add(match);
                        } else {
                            // Maybe fuzzy match? "4 A" vs "4A"
                            toDelete.push(alloc);
                        }
                    }

                    // If we deleted everything because of mismatch (e.g. CSV "4 A", DB "4A"), 
                    // we should keep at least one if CSV implies ownership.
                    if (toKeep.length === 0 && relevantCsvEntries.length > 0) {
                        // Keep the first one?
                        console.log(`   No exact match. Keeping latest.`);
                        list.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                        toKeep.push(list[0]);
                        toDelete.push(...list.slice(1));
                    }

                    // Execute Deletion
                    for (const del of toDelete) {
                        console.log(`❌ Deleting Duplicate: ${del.customer_facing_name} (${del.id})`);
                        await supabase.from('allocations').delete().eq('id', del.id);
                        deleted++;
                    }
                }
            }
        }
    }

    console.log(`✅ Cleanup Complete. Deleted ${deleted} records.`);
}

cleanDuplicates();
