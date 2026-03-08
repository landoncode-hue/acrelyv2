
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Load failed records
const failedRecsPath = '/Users/lordkay/.gemini/antigravity/brain/b6396085-d463-4baf-8e15-2dea84619230/failed_legacy_imports.json';
const rawContent = fs.readFileSync(failedRecsPath, 'utf8');
const headerIndex = rawContent.indexOf('missing records');
// Find '[' after the header, or default to checking start if header not found (fallback)
const jsonStart = rawContent.indexOf('[');
// If we found 'missing records', try to find '[' AFTER it.
const jsonStartAfterHeader = rawContent.indexOf('[', headerIndex > -1 ? headerIndex : 0);
const finalJsonStart = (headerIndex > -1 && jsonStartAfterHeader > -1) ? jsonStartAfterHeader : jsonStart;

if (finalJsonStart === -1) throw new Error('No JSON array found in failure report');
const failedRecs = JSON.parse(rawContent.substring(finalJsonStart));

// Load CSV to get amount/date
const csvPath = '/Users/lordkay/Development/acrely/legacy-data/unified_legacy_data_cleaned.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');
const { data: allRecords } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

async function processFailed() {
    console.log(`🚀 Processing ${failedRecs.length} failed records...`);

    let success = 0;
    let fail = 0;

    for (const rec of failedRecs) {
        console.log(`\nProcessing: ${rec.name} (${rec.email})`);

        try {
            const fullRecord = allRecords[rec.row - 1] as any;
            if (!fullRecord) throw new Error(`Could not find CSV record at row ${rec.row}`);

            const amountPaid = parseFloat(fullRecord['Amount Paid']?.replace(/,/g, '') || '0');
            const paymentDate = fullRecord['Date'];

            // 1. Find or Create Customer
            let customerId = null;

            const { data: existingEmail } = await supabase.from('customers').select('id').eq('email', rec.email).single();
            if (existingEmail) {
                customerId = existingEmail.id;
                console.log(`   ✅ Found existing customer by email: ${customerId}`);
            } else {
                const phone = rec.phone.replace(/\D/g, '');
                const { data: existingPhone } = await supabase.from('customers').select('id').eq('phone', phone).single();

                if (existingPhone) {
                    customerId = existingPhone.id;
                    console.log(`   ✅ Found existing customer by phone: ${customerId}`);
                } else {
                    const { data: newCust, error: custErr } = await supabase.from('customers').insert({
                        full_name: rec.name,
                        email: rec.email,
                        phone: rec.phone,
                        address: 'Legacy Address (Imported)'
                    }).select('id').single();

                    if (custErr) throw new Error(`Customer creation failed: ${custErr.message}`);
                    customerId = newCust.id;
                    console.log(`   ✨ Created new customer: ${customerId}`);
                }
            }

            // 2. Find Estate
            const { data: estate, error: estateErr } = await supabase.from('estates').select('id, name').ilike('name', rec.estate).single();
            if (estateErr || !estate) {
                throw new Error(`Estate not found: ${rec.estate}`);
            }
            console.log(`   Found estate: ${estate.name}`);

            // 3. Create/Find Plot
            let plotId = null;
            let plotNum = rec.plot || `Legacy-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            let isHalf = false;
            let designation = null;

            // Parse Native Half Plot (e.g., "13A" -> "13", A)
            // Use same logic as refactor script to match "4A", "4B" styles
            const hpMatch = plotNum.match(/^(\d+)([AB])$/i);
            if (hpMatch) {
                plotNum = `PLOT-${hpMatch[1].padStart(3, '0')}`; // Standardize name immediately
                isHalf = true;
                designation = hpMatch[2].toUpperCase();
            } else {
                // Also standardize normal plots? "15" -> "PLOT-015"
                // Only if it looks like a number
                if (/^\d+$/.test(plotNum)) {
                    plotNum = `PLOT-${plotNum.padStart(3, '0')}`;
                }
            }

            // Find existing
            let plotQuery = supabase.from('plots')
                .select('id, is_half_plot')
                .eq('estate_id', estate.id)
                .eq('plot_number', plotNum);

            const { data: existingPlot, error: findErr } = await plotQuery.maybeSingle();

            if (existingPlot) {
                plotId = existingPlot.id;
                console.log(`   ✅ Found existing plot: ${plotNum} ${designation ? `(${designation})` : ''}`);
            } else {
                const { data: newPlot, error: plotErr } = await supabase.from('plots').insert({
                    estate_id: estate.id,
                    plot_number: plotNum,
                    status: 'sold', // Lowercase 'sold'
                    is_half_plot: isHalf,
                    half_plot_designation: designation
                }).select('id').single();

                if (plotErr) throw new Error(`Plot creation failed: ${plotErr.message}`);
                plotId = newPlot.id;
                console.log(`   ✨ Created plot: ${plotNum} ${designation ? `(${designation})` : ''} (ID: ${plotId})`);
            }

            // 4. Create Allocation
            // Check if allocation already exists for this plot? To avoid dups on re-run
            const { data: existingAlloc } = await supabase.from('allocations').select('id').eq('plot_id', plotId).single();

            let allocationId = null;
            if (existingAlloc) {
                allocationId = existingAlloc.id;
                console.log(`   ✅ Allocation already exists: ${allocationId}`);
            } else {
                const { data: allocation, error: allocErr } = await supabase.from('allocations').insert({
                    customer_id: customerId,
                    estate_id: estate.id,
                    plot_id: plotId,
                    status: 'completed', // Lowercase 'completed'
                    allocation_date: paymentDate || new Date().toISOString()
                }).select('id').single();

                if (allocErr) throw new Error(`Allocation failed: ${allocErr.message}`);
                allocationId = allocation.id;
                console.log(`   ✨ Allocation created: ${allocationId}`);
            }

            // 5. Create Payment
            // Check if payment exists for this allocation?
            if (amountPaid > 0) {
                const { data: existingPay } = await supabase.from('payments').select('id').eq('allocation_id', allocationId).single();
                if (!existingPay) {
                    const { error: payErr } = await supabase.from('payments').insert({
                        allocation_id: allocationId,
                        amount: amountPaid,
                        payment_date: paymentDate || new Date().toISOString(),
                        payment_method: 'Bank Transfer',
                        status: 'completed', // Lowercase 'completed'
                        transaction_reference: `LEGACY-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                    });
                    if (payErr) console.error(`   ⚠️ Payment insert failed: ${payErr.message}`);
                    else console.log(`   💰 Payment recorded: N${amountPaid}`);
                } else {
                    console.log(`   ✅ Payment already exists`);
                }
            }

            success++;

        } catch (e: any) {
            console.error(`   ❌ Failed: ${e.message}`);
            fail++;
        }
    }

    console.log(`\nImport Retry Complete. Success: ${success}, Fail: ${fail}`);
}

processFailed();
