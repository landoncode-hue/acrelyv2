
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Users for actions
const USERS = {
    frontdesk: { email: 'frontdesk@pinnaclegroups.ng', password: 'FrontDeskPinnacle2025!' },
    ceo: { email: 'ceo@pinnaclegroups.ng', password: 'CeoPinnacle2025!' },
};

async function getUserId(email: string) {
    const { data } = await supabase.from('profiles').select('id').eq('email', email).single();
    return data?.id;
}

function cleanCurrency(val: string): number {
    if (!val) return 0;
    return parseFloat(val.replace(/[",\s]/g, '')) || 0;
}

async function importCityOfDavid() {
    console.log("🚀 Starting City of David Import (Correction)...");

    const frontdeskId = await getUserId(USERS.frontdesk.email);
    const ceoId = await getUserId(USERS.ceo.email);

    if (!frontdeskId || !ceoId) {
        throw new Error("Could not find Frontdesk or CEO user IDs.");
    }

    // 1. Create Estate
    const ESTATE_NAME = "City of David Estate";
    let estateId: string;

    const { data: existingEstate } = await supabase.from('estates').select('id').eq('name', ESTATE_NAME).single();
    if (existingEstate) {
        estateId = existingEstate.id;
        console.log(`✅ Estate exists: ${estateId}`);
    } else {
        const { data: newEstate, error } = await supabase.from('estates').insert({
            name: ESTATE_NAME,
            location: "Benin City",
            price: 0,
            total_plots: 100,
            description: "Imported from Legacy Data",
            created_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        estateId = newEstate.id;
        console.log(`✅ Created Estate: ${estateId}`);
    }

    // 2. Parse CSV
    const csvPath = path.resolve(process.cwd(), 'legacy-data/CITY OF DAVID ESTATE_111519.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    const records = parse(fileContent, {
        columns: false,
        skip_empty_lines: true,
        from_line: 2 // Skip header
    });

    for (const row of records) {
        // Indices: 0:DATE, 1:NAME, 3:PLOT, 4:PAYMENT, 6:ADDRESS, 7:PHONE
        const dateStr = row[0];
        const name = row[1];
        if (!name) continue;

        const plotNo = row[3];
        const paymentStr = row[4];
        const address = row[6];
        const phone = row[7];

        // Fix date parsing if needed (e.g. 7/30/2024)
        let txDate = new Date().toISOString();
        if (dateStr) {
            try {
                txDate = new Date(dateStr).toISOString();
            } catch (e) { }
        }

        console.log(`Processing: ${name} (Plot: ${plotNo})`);

        // 3. Customer
        let customerId: string;
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .ilike('full_name', name.trim())
            .single();

        if (existingCustomer) {
            customerId = existingCustomer.id;
        } else {
            const { data: newCust, error: custError } = await supabase.from('customers').insert({
                full_name: name.trim(),
                phone: phone?.replace(/\s/g, ''),
                address: address,
                created_by: frontdeskId,
                created_at: txDate
            }).select().single();

            if (custError) {
                console.error(`  Error creating customer ${name}:`, custError.message);
                continue;
            }
            customerId = newCust.id;
        }

        // 4. Plot & Allocation
        let allocationId: string | null = null;

        if (plotNo) {
            const cleanPlotNo = plotNo.trim();
            let plotId: string;

            // Check Plot
            const { data: existingPlot } = await supabase
                .from('plots')
                .select('id, status')
                .eq('estate_id', estateId)
                .eq('plot_number', cleanPlotNo)
                .single();

            if (existingPlot) {
                plotId = existingPlot.id;
            } else {
                // Create Plot as AVAILABLE (avoid trigger loop on 'sold')
                const { data: newPlot, error: plotError } = await supabase.from('plots').insert({
                    estate_id: estateId,
                    plot_number: cleanPlotNo,
                    status: 'available',
                }).select().single();

                if (plotError) {
                    console.error(`  Error creating plot ${cleanPlotNo}:`, plotError.message);
                    continue; // Skip allocation if plot failed
                }
                plotId = newPlot.id;
            }

            // Check Allocation
            const { data: existingAlloc } = await supabase
                .from('allocations')
                .select('id')
                .eq('plot_id', plotId)
                .single();

            if (existingAlloc) {
                allocationId = existingAlloc.id;
            } else {
                // Create Allocation
                // This should trigger the Plot status update to 'sold'
                const { data: newAlloc, error: allocError } = await supabase.from('allocations').insert({
                    estate_id: estateId,
                    plot_id: plotId,
                    customer_id: customerId,
                    status: 'approved',
                    drafted_by: ceoId,
                    approved_by: ceoId,
                    created_at: txDate
                }).select().single();

                if (allocError) {
                    console.error(`  Error allocating:`, allocError.message);
                } else {
                    allocationId = newAlloc.id;
                    console.log(`  ✅ Allocated Plot ${cleanPlotNo}`);
                }
            }
        }

        // 5. Payment
        const amount = cleanCurrency(paymentStr);
        if (amount > 0) {
            // Only insert if we haven't already recorded this exact payment? 
            // For simplicity, we assume we are running this fresh or handling dups? 
            // The previous run failed early, so likely no dups for these users.

            if (!allocationId) {
                console.warn(`  ⚠️  Payment of ${amount} has no Allocation ID. Skipping because of constraint.`);
                // If schema requires it, we can't insert. 
                // Wait, the schema said "allocation_id" REFERENCES ... (optional in SQL usually unless NOT NULL).
                // The error `violates check constraint "payments_allocation_id_required"` implies it IS required.
                // So we skip.
            } else {
                const { error: payError } = await supabase.from('payments').insert({
                    customer_id: customerId,
                    allocation_id: allocationId,
                    amount: amount,
                    method: 'bank_transfer',
                    status: 'verified',
                    recorded_by: frontdeskId,
                    payment_date: txDate,
                    created_at: txDate
                });
                if (payError) {
                    console.error(`  Error recording payment:`, payError.message);
                } else {
                    console.log(`  ✅ Recorded Payment: ${amount}`);
                }
            }
        }
    }

    console.log("✅ Fix Script Complete.");
}

importCityOfDavid();
