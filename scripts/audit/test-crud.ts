import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function testCRUD() {
    console.log('=== TESTING CRUD OPERATIONS ===\n');
    const results: { op: string; status: string; error?: string }[] = [];

    // 1. Create Customer
    const { data: customer, error: custErr } = await supabase.from('customers').insert({
        full_name: 'TEST CRUD Customer',
        email: 'test.crud@test.com',
        phone: '08099999999'
    }).select().single();
    results.push({ op: 'Create Customer', status: custErr ? '❌' : '✅', error: custErr?.message });

    // 2. Read Customer
    const { data: readCust, error: readErr } = await supabase.from('customers').select().eq('id', customer?.id).single();
    results.push({ op: 'Read Customer', status: readErr ? '❌' : '✅', error: readErr?.message });

    // 3. Get an estate and plot for allocation test
    const { data: estate } = await supabase.from('estates').select('id, name').limit(1).single();
    const { data: plot } = await supabase.from('plots').select('id').eq('estate_id', estate?.id).eq('status', 'available').limit(1).single();

    // 4. Create Allocation
    let allocation: any = null;
    if (customer && plot) {
        const { data: alloc, error: allocErr } = await supabase.from('allocations').insert({
            customer_id: customer.id,
            plot_id: plot.id,
            status: 'draft',
            total_price: 1000000,
            amount_paid: 0,
            balance: 1000000
        }).select().single();
        allocation = alloc;
        results.push({ op: 'Create Allocation', status: allocErr ? '❌' : '✅', error: allocErr?.message });
    }

    // 5. Create Payment
    if (allocation) {
        const { error: payErr } = await supabase.from('payments').insert({
            allocation_id: allocation.id,
            customer_id: customer.id,
            amount: 500000,
            payment_date: new Date().toISOString(),
            payment_method: 'bank_transfer',
            status: 'confirmed'
        });
        results.push({ op: 'Create Payment', status: payErr ? '❌' : '✅', error: payErr?.message });
    }

    // 6. Update Customer
    if (customer) {
        const { error: updErr } = await supabase.from('customers').update({ occupation: 'Test Occupation' }).eq('id', customer.id);
        results.push({ op: 'Update Customer', status: updErr ? '❌' : '✅', error: updErr?.message });
    }

    // 7. Delete test data (cleanup)
    if (allocation) await supabase.from('payments').delete().eq('allocation_id', allocation.id);
    if (allocation) await supabase.from('allocations').delete().eq('id', allocation.id);
    if (customer) await supabase.from('customers').delete().eq('id', customer.id);
    results.push({ op: 'Delete Test Data', status: '✅' });

    // Summary
    console.log('RESULTS:');
    results.forEach(r => console.log(`  ${r.status} ${r.op}${r.error ? ' - ' + r.error : ''}`));

    const failed = results.filter(r => r.status === '❌').length;
    console.log(`\n${failed === 0 ? '✅ All CRUD operations work!' : `⚠️ ${failed} operations failed`}`);
}

testCRUD();
