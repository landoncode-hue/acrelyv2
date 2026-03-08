
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

// Helper to calculate total price
// In CSV: Payment (5) and Balance (6). 
// If Balance is empty, assumed 0? Or Check context.
// Some rows have Balance.
function calculateTotal(paid: number, balanceStr: string): number {
    const bal = cleanCurrency(balanceStr);
    return paid + bal;
}

// Helper to parse plot
function parsePlot(plotStr: string) {
    const clean = plotStr.trim().toUpperCase();
    // Standardize: "6A" -> "6", "A"
    const match = clean.match(/^(\d+)([A-Za-z])$/);
    if (match) {
        return { base: match[1], suffix: match[2], isHalf: true, fullName: clean };
    }
    return { base: clean, suffix: null, isHalf: false, fullName: clean };
}

async function importCityOfDavid() {
    console.log("🚀 Starting City of David Import (Smart Allocations)...");

    const frontdeskId = await getUserId(USERS.frontdesk.email);
    const ceoId = await getUserId(USERS.ceo.email);
    if (!frontdeskId || !ceoId) throw new Error("Missing Users");

    // 1. Estate
    const ESTATE_NAME = "City of David Estate";
    let estateId: string;
    const { data: est } = await supabase.from('estates').select('id').eq('name', ESTATE_NAME).single();
    if (est) {
        estateId = est.id;
    } else {
        const { data: newEst } = await supabase.from('estates').insert({
            name: ESTATE_NAME,
            location: "Benin City",
            price: 0,
            total_plots: 100,
        }).select().single();
        estateId = newEst.id;
    }

    // 2. CSV
    const csvPath = path.resolve(process.cwd(), 'legacy-data/CITY OF DAVID ESTATE_111519.csv');
    const records = parse(fs.readFileSync(csvPath, 'utf-8'), {
        columns: false,
        skip_empty_lines: true,
        from_line: 2
    });

    for (const row of records) {
        // 0:DATE, 1:NAME, 3:PLOT, 4:PAYMENT, 5:BALANCE, 6:ADDRESS, 7:PHONE
        const name = row[1];
        if (!name) continue;

        const plotRaw = row[3];
        const paymentStr = row[4];
        const balanceStr = row[5];
        const address = row[6];
        const phone = row[7];

        // Date
        let txDate = new Date().toISOString();
        if (row[0]) { try { txDate = new Date(row[0]).toISOString(); } catch (e) { } }

        console.log(`Processing: ${name} (Plot: ${plotRaw})`);

        // 3. Customer
        let customerId: string;
        const { data: existCust } = await supabase.from('customers').select('id').ilike('full_name', name.trim()).single();
        if (existCust) {
            customerId = existCust.id;
        } else {
            const { data: newCust, error: custError } = await supabase.from('customers').insert({
                full_name: name.trim(),
                phone: phone?.replace(/\s/g, ''),
                address: address,
                created_by: frontdeskId,
                created_at: txDate
            }).select().single();
            if (custError || !newCust) {
                console.error(`  Error creating Customer ${name}:`, custError?.message);
                continue;
            }
            customerId = newCust.id;
        }

        // 4. Plot & Allocation
        if (plotRaw) {
            const { base, isHalf, fullName } = parsePlot(plotRaw);

            // Fetch/Create BASE Plot
            let plotId: string;
            const { data: existPlot } = await supabase.from('plots')
                .select('id')
                .eq('estate_id', estateId)
                .eq('plot_number', base) // Use BASE number "6" not "6A"
                .single();

            if (existPlot) {
                plotId = existPlot.id;
            } else {
                // Insert as 'available' first
                const { data: newPlot, error: pErr } = await supabase.from('plots').insert({
                    estate_id: estateId,
                    plot_number: base,
                    status: 'available'
                }).select().single();
                if (pErr) {
                    console.error(`  Error creating Base Plot ${base}:`, pErr.message);
                    continue;
                }
                plotId = newPlot.id;
            }

            // Allocation
            const paymentAmt = cleanCurrency(paymentStr);
            const totalAmt = calculateTotal(paymentAmt, balanceStr);

            // Check if THIS Customer is already allocated to THIS Plot (Base)
            // (Assumes one allocation per customer per plot base?)
            // Actually, querying by plot_id and customer_id is safer.
            const { data: existAlloc } = await supabase.from('allocations')
                .select('id')
                .eq('plot_id', plotId)
                .eq('customer_id', customerId)
                .single();

            let allocationId = existAlloc?.id;

            if (!allocationId) {
                // Create Allocation
                const { data: newAlloc, error: aErr } = await supabase.from('allocations').insert({
                    estate_id: estateId,
                    plot_id: plotId,
                    customer_id: customerId,
                    status: 'approved',
                    plot_size: isHalf ? 'half_plot' : 'full_plot',
                    customer_facing_name: fullName, // Store "6A" here
                    total_price: totalAmt > 0 ? totalAmt : 5000000, // Default if 0 to avoid constraint?
                    plan_type: 'outright', // Correct column name
                    drafted_by: ceoId,
                    approved_by: ceoId,
                    allocation_date: txDate,
                    created_at: txDate
                }).select().single();

                if (aErr) {
                    console.error(`  Error Allocating:`, aErr.message);
                } else {
                    allocationId = newAlloc.id;
                    console.log(`  ✅ Allocated ${fullName} (Base: ${base})`);
                }
            }

            // 5. Payment
            if (allocationId && paymentAmt > 0) {
                // Check if total_price is sufficient?
                // If we just created it with totalAmt, it should be fine.
                // If it existed, we might need to update total_price if it was 0?

                const { error: pyErr } = await supabase.from('payments').insert({
                    customer_id: customerId,
                    allocation_id: allocationId,
                    amount: paymentAmt,
                    status: 'verified',
                    recorded_by: frontdeskId,
                    payment_date: txDate,
                    created_at: txDate
                });

                if (pyErr) console.error(`  Error Payment:`, pyErr.message);
                else console.log(`  ✅ Paid ${paymentAmt}`);
            }
        }
    }
    console.log("✅ Smart Script Complete");
}

importCityOfDavid();
