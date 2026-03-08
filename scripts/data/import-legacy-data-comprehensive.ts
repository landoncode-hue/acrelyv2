import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LEGACY_DATA_DIR = path.join(process.cwd(), 'legacy-data');

// Estate name mapping from CSV filenames to database names
const ESTATE_NAME_MAP: Record<string, string> = {
    'CITY OF DAVID ESTATE': 'City of David Estate',
    'EHI GREEN PARK ESTATE': 'Ehi Green Park Estate',
    'HECTARES OF DIAMOND ESTATE': 'Hectares of Diamond Estate',
    'NEW ERA ESTATE': 'New Era of Wealth Estate',
    'NEW ERA OF WEALTH ESTATE': 'New Era of Wealth Estate',
    'OSE PERFECTION GARDEN': 'Ose Perfection Garden',
    'SOAR HIGH ESTATE': 'Soar High Estate',
    'SUCCESS PALACE ESTATE': 'Success Palace Estate',
    'WEALTHY PLACE ESTATE': 'The Wealthy Place Estate',
    'ODUWA HOUSING ESTATE': 'Oduwa Housing Estate'
};

interface LegacyRecord {
    date: string;
    customerName: string;
    plotSize: string;
    plotNo: string;
    payment: string;
    balance: string;
    phoneNumber: string;
    address: string;
    referredBy: string;
    estateName: string;
    email: string;
}

interface PlotInfo {
    plotNumber: string;
    halfType?: 'A' | 'B';
}

// Helper to clean and parse money values
function parseMoney(str: string): number {
    if (!str || str.trim() === '') return 0;
    const cleaned = str.replace(/[^0-9.-]/g, '');
    const value = parseFloat(cleaned);
    return isNaN(value) ? 0 : value;
}

// Helper to parse dates with multiple format support
function parseDate(dateStr: string): string {
    if (!dateStr || dateStr.trim() === '') return new Date().toISOString();
    try {
        const trimmed = dateStr.trim();
        // Check for DD-MMM or DD/MM where year is missing
        const parts = trimmed.split(/[-/]/);

        if (parts.length === 2) {
            // Assume 2024 for legacy records missing year
            const day = parseInt(parts[0]);
            const monthStr = parts[1];
            const monthMap: Record<string, number> = {
                'jan': 0, 'january': 0, 'feb': 1, 'february': 1, 'mar': 2, 'march': 2,
                'apr': 3, 'april': 3, 'may': 4, 'jun': 5, 'june': 5, 'jul': 6, 'july': 6,
                'aug': 7, 'august': 7, 'sep': 8, 'september': 8, 'oct': 9, 'october': 9,
                'nov': 10, 'november': 10, 'dec': 11, 'december': 11
            };
            const month = monthMap[monthStr.toLowerCase()] ?? parseInt(monthStr) - 1;
            if (!isNaN(day) && !isNaN(month)) return new Date(2024, month, day).toISOString();
        }

        let date = new Date(trimmed);
        if (isNaN(date.getTime()) || date.getFullYear() === 2001) {
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const monthStr = parts[1];
                let year = parseInt(parts[2]);
                if (year < 100) year = year < 50 ? 2000 + year : 1900 + year;
                const monthMap: Record<string, number> = {
                    'jan': 0, 'january': 0, 'feb': 1, 'february': 1, 'mar': 2, 'march': 2,
                    'apr': 3, 'april': 3, 'may': 4, 'jun': 5, 'june': 5, 'jul': 6, 'july': 6,
                    'aug': 7, 'august': 7, 'sep': 8, 'september': 8, 'oct': 9, 'october': 9,
                    'nov': 10, 'november': 10, 'dec': 11, 'december': 11
                };
                const month = monthMap[monthStr.toLowerCase()] ?? parseInt(monthStr) - 1;
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) date = new Date(year, month, day);
            } else if (parts.length === 2) {
                // Already handled above but for safety
                const day = parseInt(parts[0]);
                const monthStr = parts[1];
                const monthMap: Record<string, number> = {
                    'jan': 0, 'january': 0, 'feb': 1, 'february': 1, 'mar': 2, 'march': 2,
                    'apr': 3, 'april': 3, 'may': 4, 'jun': 5, 'june': 5, 'jul': 6, 'july': 6,
                    'aug': 7, 'august': 7, 'sep': 8, 'september': 8, 'oct': 9, 'october': 9,
                    'nov': 10, 'november': 10, 'dec': 11, 'december': 11
                };
                const month = monthMap[monthStr.toLowerCase()] ?? parseInt(monthStr) - 1;
                if (!isNaN(day) && !isNaN(month)) date = new Date(2024, month, day);
            }
        }
        if (!isNaN(date.getTime())) return date.toISOString();
    } catch (error) { console.warn(`Failed to parse date: ${dateStr}`); }
    return new Date().toISOString();
}

// Helper to extract plot numbers and determine if it's a half plot
function parsePlotInfo(plotNo: string): PlotInfo[] {
    if (!plotNo || plotNo.trim() === '') return [];
    const raw = plotNo.trim().replace(/^['`]/, ''); // Clean leading quotes
    const results: PlotInfo[] = [];

    // Handle ranges like 195-285 separately or split them
    const parts = raw.split(/[,&/]| and /i).map(p => p.trim()).filter(p => p !== '');

    for (const part of parts) {
        if (/^\d+-\d+$/.test(part)) {
            const [start, end] = part.split('-').map(s => parseInt(s));
            if (!isNaN(start) && !isNaN(end)) {
                // If it's a large range, maybe we just record it as one entry?
                // For now, let's keep it consistent
                for (let i = start; i <= end; i++) results.push({ plotNumber: i.toString() });
            }
        } else {
            // Match things like 13A, 13 B, 13-A
            const match = part.match(/^(\d+)\s*[- ]*\s*([AB])$/i);
            if (match) {
                results.push({ plotNumber: match[1], halfType: match[2].toUpperCase() as 'A' | 'B' });
            } else {
                results.push({ plotNumber: part });
            }
        }
    }
    return results;
}

function cleanPhoneNumber(phone: string): string | null {
    if (!phone || phone.trim() === '') return null;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10 && cleaned.length <= 14) return cleaned;
    return null;
}

// Analyze a record for data quality
function analyzeRecord(record: any, rowIndex: number, estateName: string): {
    isValid: boolean;
    warnings: string[];
    record: LegacyRecord | null;
} {
    const warnings: string[] = [];
    // Unified CSV Header mapping
    const date = record['Date'] || record['DATE'] || '';
    const customerName = record['Customer Name'] || record['CUSTOMER NAME'] || '';
    const estateNameRaw = record['Estate Name'] || estateName || ''; // Use row value if available
    const plotSize = record['Plot Size'] || record['PLOT SIZE'] || '';
    const plotNo = record['Plot No'] || record['PLOT NO'] || '';
    const payment = record['Amount Paid (N)'] || record['Amount Paid'] || record['PAYMENT'] || '';
    const balance = record['Balance (N)'] || record['Balance'] || record['BALANCE'] || '';
    const phoneNumber = record['Phone Number'] || record['PHONE NO'] || '';
    const address = record['Address'] || record['ADDRESS'] || '';
    const referredBy = record['Referral'] || record['REFERRED BY'] || '';
    const email = record['Email'] || record['EMAIL'] || '';

    if (!customerName || customerName.trim() === '') {
        warnings.push(`Row ${rowIndex}: Missing customer name`);
        return { isValid: false, warnings, record: null };
    }
    const cleanedPhone = cleanPhoneNumber(phoneNumber);
    if (!cleanedPhone) {
        warnings.push(`Row ${rowIndex}: Invalid/missing phone number for ${customerName}`);
    }

    return {
        isValid: true, warnings,
        record: {
            date, customerName: customerName.trim(), plotSize, plotNo, payment, balance,
            phoneNumber: cleanedPhone || phoneNumber, address, referredBy,
            estateName: estateNameRaw, email: email.trim()
        }
    };
}

// Export for use in tests by defining it as export async function
export async function importLegacyData() {
    console.log('🚀 Starting Legacy Data Import (Unified/Clean)...');

    // 0. Cleanup Previous Legacy Import
    console.log('🧹 Cleaning up previous legacy import records...');
    // Delete payments first (FK)
    await supabase.from('payments').delete().like('transaction_ref', 'LEGACY-%');
    // Delete allocation_plots junction records
    await supabase.from('allocation_plots').delete().neq('allocation_id', '00000000-0000-0000-0000-000000000000');
    // Delete allocations (now that payments and junction are gone)
    await supabase.from('allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Reset plots to available
    await supabase.from('plots').update({ status: 'available', customer_id: null, half_a_allocation_id: null, half_b_allocation_id: null }).neq('id', '00000000-0000-0000-0000-000000000000');

    // 1. Load Estates
    const { data: estates, error: estatesError } = await supabase.from('estates').select('id, name');
    if (estatesError || !estates) { console.error('❌ Failed to load estates:', estatesError); return; }

    const estateMap = new Map<string, string>();
    estates.forEach(estate => estateMap.set(estate.name.toLowerCase().trim(), estate.id));

    // 2. Read Combined File
    const targetFile = 'unified_legacy_data.csv';
    console.log(`📄 Reading: ${targetFile}`);

    const filePath = path.join(LEGACY_DATA_DIR, targetFile);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    let records;
    try {
        records = parse(fileContent, {
            columns: true, skip_empty_lines: true, trim: true, bom: true, relax_column_count: true, relax_quotes: true
        });
    } catch (parseError) {
        console.error(`❌ Failed to parse CSV`, parseError);
        return;
    }

    let totalRecords = 0, successCount = 0, errorCount = 0, skippedCount = 0;
    const allWarnings: string[] = [];
    const processedCustomers = new Map<string, string>();
    let dummyPhoneCounter = 1;

    // 3. Process Rows
    for (let i = 0; i < records.length; i++) {
        const row = records[i];
        totalRecords++;

        const analysis = analyzeRecord(row, i + 2, '');
        if (analysis.warnings.length > 0) allWarnings.push(...analysis.warnings);
        if (!analysis.isValid || !analysis.record) { skippedCount++; continue; }

        const record = analysis.record;
        const estateKey = record.estateName.toLowerCase().trim();
        let estateId = estateMap.get(estateKey);

        if (!estateId && ESTATE_NAME_MAP[record.estateName.toUpperCase()]) {
            const mappedName = ESTATE_NAME_MAP[record.estateName.toUpperCase()];
            estateId = estateMap.get(mappedName.toLowerCase());
        }

        if (!estateId) {
            console.warn(`⚠️  Row ${i + 2}: Estate not found/mapped: "${record.estateName}"`);
            skippedCount++;
            continue;
        }

        try {
            const transactionDate = parseDate(record.date);
            const paymentAmount = parseMoney(record.payment);
            const balanceAmount = parseMoney(record.balance);
            const totalValue = paymentAmount + balanceAmount;

            let customerId: string;
            let phoneToUse = record.phoneNumber;
            if (!phoneToUse || phoneToUse.trim() === '') {
                phoneToUse = `+234${String(dummyPhoneCounter++).padStart(10, '0')}`;
            }

            const phoneKey = phoneToUse.toLowerCase();
            if (processedCustomers.has(phoneKey)) {
                customerId = processedCustomers.get(phoneKey)!;
            } else {
                let { data: existingCustomer } = await supabase.from('customers').select('id').eq('phone', phoneToUse).maybeSingle();
                if (existingCustomer) {
                    customerId = existingCustomer.id;
                } else {
                    const { data: newCustomer, error: customerError } = await supabase.from('customers')
                        .insert({
                            full_name: record.customerName,
                            phone: phoneToUse,
                            address: record.address || null,
                            email: record.email || null,
                            created_at: transactionDate
                        })
                        .select().single();
                    if (customerError) {
                        if (customerError.message.includes('duplicate') || customerError.code === '23505') {
                            const { data: retry } = await supabase.from('customers').select('id').eq('phone', phoneToUse).maybeSingle();
                            if (retry) { customerId = retry.id; } else {
                                console.error(`   ❌ Duplicate customer error but retrieval failed for ${phoneToUse}:`, customerError.message);
                                errorCount++; continue;
                            }
                        } else {
                            console.error(`   ❌ Error creating customer ${record.customerName}:`, customerError.message);
                            errorCount++; continue;
                        }
                    } else { customerId = newCustomer.id; }
                }
                processedCustomers.set(phoneKey, customerId);
            }

            const parsedPlotInfos = parsePlotInfo(record.plotNo);
            const resolvedPlotIds: string[] = [];
            const halfPlotData: Record<string, 'A' | 'B'> = {};

            for (const pInfo of parsedPlotInfos) {
                let plotId: string | null = null;
                const numericPart = pInfo.plotNumber.match(/^\d+/)?.[0];
                const standardizedPlotNumber = numericPart ? `PLOT-${numericPart.padStart(3, '0')}` : null;

                if (standardizedPlotNumber) {
                    const { data: officialPlot } = await supabase.from('plots').select('id').eq('estate_id', estateId).eq('plot_number', standardizedPlotNumber).maybeSingle();
                    if (officialPlot) plotId = officialPlot.id;
                }
                if (!plotId) {
                    const { data: rawMatch } = await supabase.from('plots').select('id').eq('estate_id', estateId).eq('plot_number', pInfo.plotNumber).maybeSingle();
                    if (rawMatch) plotId = rawMatch.id;
                }
                if (!plotId) {
                    const { data: newPlot, error: plotCreateError } = await supabase.from('plots').insert({ estate_id: estateId, plot_number: pInfo.plotNumber, size: record.plotSize ? parseFloat(record.plotSize) : 464, status: 'available' }).select().single();
                    if (plotCreateError) { console.error(`   ❌ Error creating plot ${pInfo.plotNumber}:`, plotCreateError.message); continue; }
                    plotId = newPlot.id;
                }
                if (plotId) {
                    resolvedPlotIds.push(plotId);
                    if (pInfo.halfType) halfPlotData[plotId] = pInfo.halfType;
                }
            }

            // Create ONE allocation per row
            const primaryPlotId = resolvedPlotIds[0] || null;
            const additionalPlotIds = resolvedPlotIds.slice(1);

            const notes = [];
            if (record.referredBy) notes.push(`Referred by: ${record.referredBy}`);
            if (resolvedPlotIds.length === 0) notes.push('Unassigned Plot');

            // 1. Try to find an existing allocation for this customer and plot(s) to handle installments
            let allocId: string | null = null;
            if (primaryPlotId) {
                const { data: existingAlloc } = await supabase.from('allocations')
                    .select('id')
                    .eq('customer_id', customerId)
                    .eq('plot_id', primaryPlotId)
                    .maybeSingle();
                if (existingAlloc) allocId = existingAlloc.id;
            } else {
                // For unassigned plots, match by customer + estate + date (best effort)
                const { data: existingAlloc } = await supabase.from('allocations')
                    .select('id')
                    .eq('customer_id', customerId)
                    .eq('estate_id', estateId)
                    .eq('allocation_date', transactionDate)
                    .maybeSingle();
                if (existingAlloc) allocId = existingAlloc.id;
            }

            if (!allocId) {
                const { data: alloc, error: allocError } = await supabase.from('allocations')
                    .insert({
                        customer_id: customerId,
                        estate_id: estateId,
                        plot_id: primaryPlotId,
                        additional_plot_ids: additionalPlotIds.length > 0 ? additionalPlotIds : null,
                        status: 'approved',
                        allocation_date: transactionDate,
                        notes: notes.join(' | ') || null
                    })
                    .select().single();

                if (allocError) {
                    // If we still hit a unique constraint, it means someone else has this plot.
                    // We'll skip for now or should we record the payment against a dummy?
                    // Let's at least log well.
                    if (allocError.code === '23505') {
                        console.warn(`   ⚠️  Plot ${record.plotNo} already allocated to another customer. Row ${i + 2} skipped.`);
                    } else {
                        console.error(`   ❌ Error creating allocation:`, allocError.message);
                    }
                    errorCount++; continue;
                }
                allocId = alloc.id;

                // Status updates
                for (const pId of resolvedPlotIds) {
                    const halfType = halfPlotData[pId];
                    if (halfType) {
                        const updateData: any = {};
                        if (halfType === 'A') updateData.half_a_allocation_id = allocId;
                        if (halfType === 'B') updateData.half_b_allocation_id = allocId;
                        await supabase.from('plots').update(updateData).eq('id', pId);
                    } else {
                        await supabase.from('plots').update({ status: 'sold', customer_id: customerId }).eq('id', pId);
                    }
                    await supabase.from('allocation_plots').upsert({ allocation_id: allocId, plot_id: pId });
                }
            }

            await addFinances(allocId!, customerId, paymentAmount, balanceAmount, totalValue, transactionDate);
            successCount++;
        } catch (error) { console.error(`   ❌ Error processing row ${i + 2}:`, error); errorCount++; }
    }
    console.log(`\nImport Complete. Success: ${successCount}, Errors: ${errorCount}, Skipped: ${skippedCount}`);
}

async function addFinances(allocationId: string, customerId: string, payment: number, balance: number, total: number, date: string) {
    if (payment > 0) {
        const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('allocation_id', allocationId).eq('amount', payment);
        if (!count) {
            await supabase.from('payments').insert({
                customer_id: customerId, allocation_id: allocationId, amount: payment, payment_date: date, status: 'verified', method: 'bank_transfer',
                transaction_ref: `LEGACY-${Date.now()}-${Math.random().toString(36).substring(7)}`
            });
        }
    }
    if (balance > 0) {
        const { count } = await supabase.from('payment_plans').select('*', { count: 'exact', head: true }).eq('allocation_id', allocationId);
        if (!count) {
            await supabase.from('payment_plans').insert({
                allocation_id: allocationId, plan_type: '12_months', total_amount: total, start_date: date, duration_months: 12, status: 'active', name: 'Legacy Payment Plan'
            });
        }
    }
}

// Self-execution if run directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    importLegacyData().catch(console.error);
}
