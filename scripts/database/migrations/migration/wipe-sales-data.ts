
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function wipeData() {
    console.log('Starting data wipe...');

    // 0. Cleanup Extras & Communication
    await supabase.from('communication_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('scheduled_communications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('crm_interactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    await supabase.from('commission_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('agents').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 1. Payment Plan Installments
    const { error: err1 } = await supabase.from('payment_plan_installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err1) console.error('Error deleting installments:', err1);
    else console.log('Deleted installments.');

    // 2. Payment Plans
    const { error: err2 } = await supabase.from('payment_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err2) console.error('Error deleting plans:', err2);
    else console.log('Deleted plans.');

    // 3. Payments
    const { error: err3 } = await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err3) console.error('Error deleting payments:', err3);
    else console.log('Deleted payments.');

    // 4. Allocations & Reset Plots
    // Reset ALL plots to safeguard against data drift
    const { error: plotErr } = await supabase.from('plots').update({ status: 'available', customer_id: null }).neq('id', '00000000-0000-0000-0000-000000000000');
    if (plotErr) console.error('Error resetting plots:', plotErr);
    else console.log('Reset all plots to available.');

    const { error: err4 } = await supabase.from('allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err4) console.error('Error deleting allocations:', err4);
    else console.log('Deleted allocations.');

    // 5. Leads
    const { error: err5 } = await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err5) console.error('Error deleting leads:', err5);
    else console.log('Deleted leads.');

    // 5.5 Phone Numbers
    await supabase.from('customer_phone_numbers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Deleted all customer phone numbers.');

    // 6. Customers
    const { error: err6 } = await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err6) console.error('Error deleting customers:', err6);
    else console.log('Deleted customers.');

    // 7. Receipts
    await supabase.from('receipts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Deleted all receipts.');

    console.log('Data wipe complete.');
}

wipeData();
