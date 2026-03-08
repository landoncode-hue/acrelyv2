
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const csvPath = '/Users/lordkay/Development/acrely/legacy-data/unified_legacy_data_cleaned.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');
const { data: records } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

async function fixDates() {
    console.log(`🚀 Starting Date Fix for ${records.length} records...`);
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const record of records as any[]) {
        try {
            const email = record['Email']?.trim();
            const rawDate = record['Date'];
            const estateName = record['Estate Name']?.trim();
            const plotNo = record['Plot No']?.trim();

            // Detect and normalize date
            let dateStr = rawDate;
            if (rawDate && rawDate.includes('/')) {
                const parts = rawDate.split('/');
                if (parts.length === 3) {
                    const p0 = parseInt(parts[0], 10);
                    const p1 = parseInt(parts[1], 10);
                    const p2 = parseInt(parts[2], 10);

                    // Heuristic: If p0 > 12, it's definitely Day (DD/MM/YYYY)
                    // If p1 > 12, it's definitely Day (MM/DD/YYYY)
                    // If both <= 12, assume DD/MM/YYYY (UK/NG standard) unless p2 is the day? (Years are usually 4 digits)

                    if (p0 > 12) {
                        // DD/MM/YYYY
                        dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    } else if (p1 > 12) {
                        // MM/DD/YYYY
                        dateStr = `${parts[2]}-${parts[0]}-${parts[1]}`;
                    } else {
                        // Ambiguous. Default to US if that's what we saw earlier? 
                        // Actually "7/30/2024" was detected as M/D/Y by Postgres.
                        // "23/10/2024" failed.
                        // Let's assume M/D/Y if we can't tell, to be consistent with 7/30? 
                        // Or try to parse with JS Date?
                        // new Date("2/5/2024") -> Feb 5 (US).
                        // Let's assume MM/DD/YYYY as default if ambiguous, given 7/30 worked.
                        dateStr = `${parts[2]}-${parts[0]}-${parts[1]}`;
                    }
                }
            }

            if (!email || !dateStr) {
                skipped++;
                continue;
            }

            // 1. Find Customer
            const { data: customer } = await supabase.from('customers').select('id').ilike('email', email).single();
            if (!customer) {
                console.log(`Skipping: Cust not found: ${email}`);
                skipped++;
                continue;
            }

            // 2. Fetch ALL allocations
            const { data: allocations, error: allocErr } = await supabase.from('allocations')
                .select('id, allocation_date, estate_id, plot_id')
                .eq('customer_id', customer.id);

            if (allocErr || !allocations || allocations.length === 0) {
                console.log(allocErr ? `Query Err: ${allocErr.message}` : `Skipping: No allocations for ${email}`);
                skipped++;
                continue;
            }

            // 3. Filter for Estate Match (Manual Fetch)
            const estateAllocations = [];
            for (const alloc of allocations) {
                const { data: est } = await supabase.from('estates').select('name').eq('id', alloc.estate_id).single();
                if (est && (est.name.toLowerCase().includes(estateName.toLowerCase()) || estateName.toLowerCase().includes(est.name.toLowerCase()))) {
                    estateAllocations.push({ ...alloc, estateName: est.name });
                }
            }

            if (estateAllocations.length === 0) {
                // console.log(`Skipping: Estate mismatch for ${email}. CSV="${estateName}"`);
                skipped++;
                continue;
            }

            // 4. Find Target Allocation (Numeric Plot Lookup)
            const getInt = (s: string) => {
                const d = s?.replace(/\D/g, '') || '';
                return d ? parseInt(d, 10) : null;
            }
            const targetInt = getInt(plotNo);

            // Fetch plots for candidates
            const candidateAllocs = [];
            for (const alloc of estateAllocations) {
                const { data: plt } = await supabase.from('plots').select('plot_number').eq('id', alloc.plot_id).single();
                candidateAllocs.push({ ...alloc, plotNumber: plt?.plot_number });
            }

            // Filter by plot number match
            const matchingAllocs = candidateAllocs.filter(a => {
                // Exact match?
                if (a.plotNumber === plotNo) return true;
                // Digits match?
                const aInt = getInt(a.plotNumber);
                if (skipped < 5) console.log(`   Debug Match: ${a.plotNumber} -> ${aInt} vs Target ${plotNo} -> ${targetInt} (${aInt === targetInt})`);
                if (targetInt !== null && aInt === targetInt) return true;
                // Fuzzy?
                if (a.plotNumber?.includes(plotNo) || plotNo?.includes(a.plotNumber)) return true;
                return false;
            });

            if (matchingAllocs.length === 0) {
                console.log(`Skipping: Plot mismatch for ${email}. Target="${plotNo}" (Int=${targetInt}). Available=${JSON.stringify(candidateAllocs.map(c => c.plotNumber))}`);
                skipped++;
                continue;
            }

            // 5. Update ALL matching allocations (handle duplicates)
            for (const match of matchingAllocs) {
                const { error: updateErr } = await supabase.from('allocations')
                    .update({ allocation_date: dateStr })
                    .eq('id', match.id);

                if (updateErr) throw new Error(updateErr.message);

                await supabase.from('payments')
                    .update({ payment_date: dateStr })
                    .eq('allocation_id', match.id);
            }

            updated++;
            if (updated % 20 === 0) console.log(`✅ Progress: Updated ${updated} records...`);

        } catch (e: any) {
            console.error(`Error: ${e.message}`);
            errors++;
        }
    }

    console.log(`\n=== DATE FIX COMPLETE ===`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
}

fixDates();
