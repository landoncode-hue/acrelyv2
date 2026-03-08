
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Load CSV
const csvPath = path.resolve(__dirname, '../../legacy-data/unified_legacy_data_cleaned.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const { data: records } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

async function importAll() {
    console.log(`🚀 Starting Direct Import of ${records.length} records...`);

    let success = 0;
    let fail = 0;

    for (let i = 0; i < records.length; i++) {
        const rec = records[i] as any;
        const rowNum = i + 1;
        const customerName = rec['Customer Name']?.trim();
        const email = rec['Email']?.trim();
        const phoneRaw = rec['Phone No']?.trim();
        const estateName = rec['Estate Name']?.trim();
        const plotRaw = rec['Plot No']?.trim();

        // Clean amounts
        const amountPaid = parseFloat(rec['Amount Paid (N)']?.toString().replace(/[^0-9.]/g, '') || '0');

        // Date handling? The CSV has messy dates. We'll use today if invalid, or rely on fix-legacy-dates.ts later.
        // Actually, let's try to parse if possible, or default.
        // `fix-legacy-dates.ts` is better at this. We'll let it run after.
        const allocationDate = new Date().toISOString();

        console.log(`\n[${rowNum}] Processing: ${customerName}`);

        try {
            // 1. Find/Create Customer
            let customerId;
            // Try Email
            if (email) {
                const { data: eCust } = await supabase.from('customers').select('id').ilike('email', email).maybeSingle();
                if (eCust) customerId = eCust.id;
            }
            // Try Phone if not found
            if (!customerId && phoneRaw) {
                const phone = phoneRaw.replace(/\D/g, '');
                if (phone.length > 5) {
                    const { data: pCust } = await supabase.from('customers').select('id').like('phone', `%${phone}%`).maybeSingle();
                    if (pCust) customerId = pCust.id;
                }
            }

            if (!customerId) {
                const { data: newCust, error: cErr } = await supabase.from('customers').insert({
                    full_name: customerName,
                    email: email,
                    phone: phoneRaw,
                    address: 'Imported Legacy Customer'
                }).select('id').single();
                if (cErr) throw new Error(`Customer creation failed: ${cErr.message}`);
                customerId = newCust.id;
                console.log(`   ✨ Created Customer: ${customerId}`);
            } else {
                console.log(`   ✅ Found Customer: ${customerId}`);
            }

            // 2. Find Estate
            // Clean estate name
            const cleanEstateName = estateName?.trim();
            if (!cleanEstateName) throw new Error(`Estate Name missing in CSV`);

            const { data: estate } = await supabase.from('estates')
                .select('id')
                .ilike('name', cleanEstateName) // ilike for case-insensitivity
                .maybeSingle();

            // Retry with looser search if exact-ish fail?
            if (!estate) {
                // Try removing "Estate" or similar?
                // For now just error but log exact string
                throw new Error(`Estate not found: "${cleanEstateName}" (Length: ${cleanEstateName.length})`);
            }

            // 3. Find/Create Plot
            // Logic: Parse "13A" vs "13".
            let plotNum = plotRaw;
            let isHalf = false;
            let designation = null;

            if (!plotNum) {
                plotNum = `UNASSIGNED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                console.log(`   ⚠️ No plot number. Using placeholder: ${plotNum}`);
            } else {
                // Parse Native Half Plot logic
                const hpMatch = plotNum.match(/^(\d+)([AB])$/i);
                if (hpMatch) {
                    plotNum = `PLOT-${hpMatch[1].padStart(3, '0')}`;
                    isHalf = true;
                    designation = hpMatch[2].toUpperCase(); // Keep designation separate from plotNum for lookup? 
                    // WAIT. 
                    // In `reset-estates.ts` we create "1", "2"... 
                    // But `standardize-plots` converts to "PLOT-001".
                    // `refactor-complex` converts "PLOT-004B" -> "PLOT-004" + flags?
                    // Let's stick to the Refactor strategy: 
                    // If we insert "PLOT-004B" now, the refactor script later will split it?
                    // NO. Refactor script handles EXISTING "PLOT-004B".
                    // If we want to be "Native" from start:
                    // We should check if "PLOT-004" exists.
                    // If "4A" comes in:
                    //   We want plot_number="PLOT-004", is_half=true, des="A".
                    // But if "4B" comes later?
                    //   We want plot_number="PLOT-004", is_half=true, des="B".
                    // CONSTRAINT: (estate_id, plot_number) unique.
                    // So we CANNOT have two rows with "PLOT-004".
                    // Therefore, identifying them as "PLOT-004" + flag is structurally impossible unless they share the row (Shared Ownership).
                    // BUT the user said: "individual plots carrying the same customer data".
                    // So they MUST be separate rows.
                    // So they MUST have different plot_numbers.
                    // So "PLOT-004A" and "PLOT-004B" IS the native way, supported by flags.

                    // Revert to: plotNum = PLOT-004A.
                    plotNum = `PLOT-${hpMatch[1].padStart(3, '0')}${designation}`;
                } else if (/^\d+$/.test(plotNum)) {
                    plotNum = `PLOT-${plotNum.padStart(3, '0')}`;
                }
            }

            let plotId;
            // Upsert Plot? 
            // We might have seeded the estate with "PLOT-004".
            // If "PLOT-004A" comes in, it's a new plot?
            // Yes.

            // Check existence
            const { data: existingPlot } = await supabase.from('plots').select('id, status').eq('estate_id', estate.id).eq('plot_number', plotNum).maybeSingle();

            if (existingPlot) {
                plotId = existingPlot.id;
                console.log(`   ✅ Found Plot: ${plotNum}`);
                // Update status if needed
                if (existingPlot.status === 'available') {
                    await supabase.from('plots').update({ status: 'sold', is_half_plot: isHalf, half_plot_designation: designation }).eq('id', plotId);
                }
            } else {
                const { data: newPlot, error: pErr } = await supabase.from('plots').insert({
                    estate_id: estate.id,
                    plot_number: plotNum,
                    status: 'sold',
                    is_half_plot: isHalf,
                    half_plot_designation: designation
                }).select('id').single();

                if (pErr) throw new Error(`Plot creation failed: ${pErr.message}`);
                plotId = newPlot.id;
                console.log(`   ✨ Created Plot: ${plotNum}`);
            }

            // 4. Create Allocation
            const { data: allocCheck } = await supabase.from('allocations').select('id').eq('plot_id', plotId).eq('customer_id', customerId).maybeSingle();
            let allocationId = allocCheck?.id;

            if (!allocationId) {
                const { data: newAlloc, error: aErr } = await supabase.from('allocations').insert({
                    customer_id: customerId,
                    estate_id: estate.id,
                    plot_id: plotId,
                    status: 'completed',
                    allocation_date: allocationDate
                }).select('id').single();
                if (aErr) throw new Error(`Allocation failed: ${aErr.message}`);
                allocationId = newAlloc.id;
                console.log(`   ✨ Allocated`);
            } else {
                console.log(`   ✅ Allocation Exists`);
            }

            // 5. Payment
            if (amountPaid > 0) {
                await supabase.from('payments').insert({
                    allocation_id: allocationId,
                    amount: amountPaid,
                    payment_date: allocationDate,
                    payment_method: 'Bank Transfer',
                    status: 'completed',
                    transaction_reference: `LEGACY-IMP-${rowNum}-${Date.now()}`
                });
                console.log(`   💰 Paid: ${amountPaid}`);
            }

            success++;

        } catch (e: any) {
            console.error(`   ❌ Error: ${e.message}`);
            fail++;
        }
    }

    console.log(`\n=== Import Complete ===`);
    console.log(`Success: ${success}`);
    console.log(`Fail: ${fail}`);
}

importAll();
