
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function clearDataKeepEstatesProfiles() {
    console.log('🚧 Starting Cleanup (Keeping Estates & Profiles)...');
    console.log('Target: ', supabaseUrl);

    try {
        const deleteTable = async (table: string, idField: string = 'id') => {
            console.log(`Cleaning ${table}...`);
            // 1. Try bulk delete first
            for (let i = 0; i < 2; i++) {
                const { error } = await supabase.from(table).delete().neq(idField, '00000000-0000-0000-0000-000000000000');
                if (!error) break;
                if (i === 1) console.log(`⚠️ Bulk delete failed for ${table}, attempting individual strategy...`);
            }

            // 2. Individual fallback if needed
            const { data: remaining } = await supabase.from(table).select(idField);
            if (remaining && remaining.length > 0) {
                console.log(`Force deleting ${remaining.length} ${table} records one by one...`);
                for (const row of remaining) {
                    const { error } = await supabase.from(table).delete().eq(idField, (row as any)[idField]);
                    // Silence individual errors unless they are non-FK related
                }
            }

            const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
            console.log(`✅ ${table} has ${count || 0} records remaining.`);
        };

        // 0. Reset ALL PLOTS (Multi-pass Force Clear with Verification)
        console.log('Force-clearing ALL plot references (Exhaustive Loop)...');
        for (let pass = 1; pass <= 3; pass++) {
            console.log(`Reset Pass ${pass}...`);
            await supabase.from('plots').update({ customer_id: null, half_a_allocation_id: null, half_b_allocation_id: null, status: 'available' }).not('customer_id', 'is', null);
            await supabase.from('plots').update({ customer_id: null, half_a_allocation_id: null, half_b_allocation_id: null, status: 'available' }).not('half_a_allocation_id', 'is', null);
            await supabase.from('plots').update({ customer_id: null, half_a_allocation_id: null, half_b_allocation_id: null, status: 'available' }).not('half_b_allocation_id', 'is', null);
            await supabase.from('plots').update({ status: 'available' }).neq('status', 'available');

            const { data: lingering } = await supabase.from('plots').select('id').or('half_a_allocation_id.not.is.null,half_b_allocation_id.not.is.null,customer_id.not.is.null');
            if (!lingering || lingering.length === 0) {
                console.log('✅ All plot references successfully cleared.');
                break;
            } else {
                console.log(`⚠️ Lingering links found: ${lingering.length}. Retrying...`);
                // Force update by ID if few remain
                if (lingering.length < 50) {
                    const ids = lingering.map(p => p.id);
                    await supabase.from('plots').update({ customer_id: null, half_a_allocation_id: null, half_b_allocation_id: null, status: 'available' }).in('id', ids);
                }
            }
        }

        // 1. Logs & Comms
        await deleteTable('audit_logs');
        await deleteTable('notifications');
        await deleteTable('communications');

        // 1.5 Additional Tables that might have FKs (based on common Supabase schemas)
        await deleteTable('payment_plans'); // Do this before payments if payments have FK to plan
        await deleteTable('receipts');
        await deleteTable('payment_plan_installments');
        await deleteTable('payments');

        // 3. Allocations (Hierarchy: Plots Junction -> Allocations)
        await deleteTable('allocation_plots', 'allocation_id');
        await deleteTable('allocations');

        // 4. Leads & CRM
        await deleteTable('leads');
        await deleteTable('customer_notes');
        await deleteTable('customer_phone_numbers');
        await deleteTable('kyc_documents');
        await deleteTable('kyc_records');
        await deleteTable('customers');

        // NOTE: Skipped Profile deletion to preserve user accounts.

        console.log('✅ Cleanup Complete! (Estates and Profiles preserved)');

    } catch (error) {
        console.error('❌ Cleanup Failed:', error);
    }
}

clearDataKeepEstatesProfiles();
