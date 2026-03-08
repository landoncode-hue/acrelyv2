import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verify() {
    console.log('🧐 Verifying Migrations...');

    // 1. Check test customers
    const { data: testCustomers, error: cError } = await supabase
        .from('customers')
        .select('id, full_name')
        .or('full_name.ilike.%test%,full_name.ilike.%demo%');

    console.log(`Test customers remaining: ${testCustomers?.length || 0}`);
    if (testCustomers && testCustomers.length > 0) {
        console.log('Sample:', testCustomers.slice(0, 3));
    }

    // 2. Check allocation status
    const { data: statusCounts, error: sError } = await supabase
        .from('allocations')
        .select('status');

    const counts = statusCounts?.reduce((acc: any, curr: any) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});

    console.log('Allocation status counts:', counts);
    if (counts?.completed) {
        console.error('❌ "completed" status still exists!');
    } else {
        console.log('✅ "completed" status migrated.');
    }

    // 3. Test find_orphaned_records
    const { data: orphans, error: oError } = await supabase.rpc('find_orphaned_records');
    if (oError) {
        console.error('❌ Error calling find_orphaned_records:', oError);
    } else {
        console.log('✅ find_orphaned_records works. Results:', orphans);
    }

    // 4. Verify receipt columns
    // We can't check columns directly via API easily without a specific query, but we can try to fetch a record.
    const { data: receiptSample, error: rError } = await supabase
        .from('receipts')
        .select('id, deleted_at')
        .limit(1);

    if (rError) {
        console.error('❌ Error fetching receipts (might be empty?):', rError.message);
    } else {
        console.log('✅ Receipts table accessible. Sample:', receiptSample);
    }

    console.log('✨ Verification complete!');
}

verify().then(() => process.exit(0)).catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
});
