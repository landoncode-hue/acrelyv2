
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as Papa from 'papaparse';
import * as dotenv from 'dotenv';
import { createAllocationCore } from '../../src/lib/actions/allocation-actions';
import { randomUUID } from 'crypto';

dotenv.config();

const LEGACY_FILE = path.resolve(process.cwd(), 'legacy-data/unified_legacy_data.csv');

// --- Helpers ---

function parseDate(raw: string | undefined): string {
    if (!raw) return new Date().toISOString();
    if (raw.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const [day, month, year] = raw.split('/');
        const d = new Date(`${year}-${month}-${day}`);
        if (!isNaN(d.getTime())) return d.toISOString();
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
}

// Tokenize and Clean String
function getTokens(s: string): string[] {
    return s.toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2)
        .filter(t => !['and', 'mrs', 'mr', 'miss', 'dr', 'engr', 'hon', 'pastor', 'pst', 'chief', 'mst', 'estate', 'the'].includes(t));
}

function normalizeRaw(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\b(mr|mrs|miss|dr|engr|hon|pastor|pst|chief|mst|estate|the)\b/g, '').trim();
}

function smartMatch(targetName: string, candidates: { id: string, tokens: string[], raw: string, norm: string }[]): { id: string, name: string, score: number } | null {
    const targetTokens = getTokens(targetName);
    const targetNorm = normalizeRaw(targetName);

    if (targetTokens.length === 0) return null;

    // 0. Exact Normalization Match (Highest Priority)
    const exact = candidates.find(c => c.norm === targetNorm);
    if (exact) return { id: exact.id, name: exact.raw, score: 1000 };

    let bestMatch = null;
    let maxScore = 0;
    let minDist = 100;

    // 1. Token Match
    for (const cand of candidates) {
        const intersection = targetTokens.filter(t => cand.tokens.includes(t));
        const score = intersection.length;

        if (score > maxScore) {
            maxScore = score;
            bestMatch = cand;
        } else if (score === maxScore && score > 0) {
            const union = new Set([...targetTokens, ...cand.tokens]).size;
            const jaccard = score / union;
            const currentUnion = new Set([...targetTokens, ...bestMatch!.tokens]).size;
            const currentJaccard = maxScore / currentUnion;
            if (jaccard > currentJaccard) bestMatch = cand;
        }
    }

    if (bestMatch && maxScore >= 2) return { id: bestMatch.id, name: bestMatch.raw, score: maxScore };

    // 2. Levenshtein Fallback (Only if token match weak)
    function levenshtein(a: string, b: string): number {
        const matrix = [];
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
                else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
        return matrix[b.length][a.length];
    }

    let bestLev = null;
    // Optimization: Skip lev if mismatch is obvious (length diff > 5)
    for (const cand of candidates) {
        if (Math.abs(cand.norm.length - targetNorm.length) > 5) continue;
        const dist = levenshtein(targetNorm, cand.norm);
        if (dist < minDist) {
            minDist = dist;
            bestLev = cand;
        }
    }

    if (bestLev) {
        const len = targetNorm.length;
        const allowed = len < 5 ? 0 : len < 10 ? 2 : 4;
        if (minDist <= allowed) {
            return { id: bestLev.id, name: bestLev.raw, score: 99 };
        }
    }

    return null;
}

function normalizePlotNo(raw: string): string {
    const match = String(raw).match(/\d+/);
    if (!match) return 'unassigned';
    return `plot-${match[0].padStart(3, '0')}`;
}

// --- Main ---

async function importLegacyData() {
    console.log('🚀 Starting Import v3 (Auto-Create Customers)...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Data
    const { data: customers } = await supabase.from('customers').select('id, full_name, email');
    const { data: estates } = await supabase.from('estates').select('id, name');
    const { data: plots } = await supabase.from('plots').select('id, plot_number, estate_id');

    const customerCandidates = customers?.map(c => ({
        id: c.id,
        raw: c.full_name || '',
        norm: normalizeRaw(c.full_name || ''),
        tokens: getTokens(c.full_name || '')
    })) || [];

    const estateCandidates = estates?.map(e => ({
        id: e.id,
        raw: e.name || '',
        norm: normalizeRaw(e.name || ''),
        tokens: getTokens(e.name || '')
    })) || [];

    const plotMap = new Map();
    plots?.forEach(p => {
        const norm = normalizePlotNo(p.plot_number);
        plotMap.set(`${p.estate_id}-${norm}`, p);
    });

    const fileContent = fs.readFileSync(LEGACY_FILE, 'utf8');
    const { data: rows } = Papa.parse(fileContent, { header: true, skipEmptyLines: true });

    // System User
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const SYSTEM_USER = users?.[0];

    let success = 0, failed = 0, skipped = 0, created = 0;

    for (const row of rows as any[]) {
        const customerName = row['Customer Name']?.trim();
        const estateName = row['Estate Name']?.trim();
        const plotNo = row['Plot No']?.trim();

        if (!customerName || !estateName) { skipped++; continue; }

        // 1. CUSTOMER
        let customerId = null;
        const cMatch = smartMatch(customerName, customerCandidates);
        if (cMatch) {
            customerId = cMatch.id;
        } else {
            // Auto Create Customer
            // console.log(`   Creating Customer: ${customerName}`);
            const pseudoEmail = `legacy.${Date.now()}.${Math.floor(Math.random() * 1000)}@acrely-legacy.com`;
            const { data: newC, error: cErr } = await supabase.from('customers').insert({
                full_name: customerName,
                email: pseudoEmail,
                status: 'active' // Or 'legacy'?
            }).select('id').single();

            if (cErr || !newC) {
                console.error(`❌ Failed to create customer ${customerName}:`, cErr);
                failed++;
                continue;
            }
            customerId = newC.id;
            created++;

            // Add to cache to prevent dups in this run?
            customerCandidates.push({
                id: customerId,
                raw: customerName,
                norm: normalizeRaw(customerName),
                tokens: getTokens(customerName)
            });
        }

        // 2. ESTATE
        let estateId = null;
        const eMatch = smartMatch(estateName, estateCandidates);
        if (eMatch) {
            estateId = eMatch.id;
        } else {
            const direct = estateCandidates.find(e => e.raw.toLowerCase().includes(estateName.toLowerCase()));
            if (direct) estateId = direct.id;
            else {
                console.error(`❌ Estate Not Found: "${estateName}"`);
                failed++;
                continue;
            }
        }

        // 3. PLOT
        let plotId = null;
        let plotSize = 'full_plot';
        let preferredSuffix = undefined;
        let plotNumberClean = plotNo || 'Unassigned';

        if (plotNumberClean.toLowerCase().endsWith('a') || plotNumberClean.toLowerCase().endsWith('b')) {
            const char = plotNumberClean.slice(-1).toUpperCase();
            if (['A', 'B'].includes(char)) {
                plotSize = 'half_plot';
                preferredSuffix = char;
                plotNumberClean = plotNumberClean.slice(0, -1).trim();
            }
        }

        const plotKey = `${estateId}-${normalizePlotNo(plotNumberClean)}`;
        const plotObj = plotMap.get(plotKey);

        if (plotObj) {
            plotId = plotObj.id;
            // Idempotency
            const { data: dup } = await supabase.from('allocations').select('id').eq('customer_id', customerId).eq('plot_id', plotId).maybeSingle();
            if (dup) {
                // console.log(`⏩ Skipping Existing: ${customerName}`);
                skipped++;
                continue;
            }
        } else {
            // Try pad
            const padKey = `${estateId}-0${plotNumberClean.toLowerCase()}`;
            const padPlot = plotMap.get(padKey);
            if (padPlot) {
                plotId = padPlot.id;
                const { data: dup } = await supabase.from('allocations').select('id').eq('customer_id', customerId).eq('plot_id', plotId).maybeSingle();
                if (dup) { skipped++; continue; }
            }
        }

        const allocationInput = {
            customerId,
            estateId,
            plots: [{
                id: plotId,
                plot_number: plotNo || 'Unassigned',
                price: 0,
                size: plotSize as 'full_plot' | 'half_plot',
                preferredSuffix
            }],
            planType: 'outright',
            plotSize,
            allocationDate: parseDate(row['Date']),
            notes: 'Legacy Import v3',
            customPrice: 0,
            initialPayment: row['Amount Paid (N)'] ? {
                amount: parseFloat(String(row['Amount Paid (N)']).replace(/,/g, '')),
                method: 'bank_transfer',
                date: parseDate(row['Date']),
                reference: 'LEGACY-IMPORT'
            } : undefined
        };

        try {
            const result = await createAllocationCore(supabase, SYSTEM_USER, allocationInput);
            if (result.success && result.allocationIds) {
                // Auto Approve
                for (const aid of result.allocationIds) {
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    const service = new (require('../../src/lib/services/AllocationService').AllocationService)(supabase);
                    await service.approve(aid, SYSTEM_USER.id);
                }
            }
            success++;
            process.stdout.write('.');
        } catch (e: any) {
            console.error(`\n❌ Error importing ${customerName}: ${e.message}`);
            failed++;
        }
    }

    console.log(`\nDONE. Success: ${success}, Created Customers: ${created}, Failed: ${failed}, Skipped: ${skipped}`);
}

importLegacyData();
