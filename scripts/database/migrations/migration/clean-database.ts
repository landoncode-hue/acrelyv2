import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
console.log('Connecting to:', process.env.NEXT_PUBLIC_SUPABASE_URL);

async function main() {
    // Safety Force Flag Check
    const isForce = process.argv.includes('--force');
    if (!isForce) {
        console.error('❌ SAFETY HALT: You must pass "--force" to wipe the database.');
        console.error('   Usage: npx tsx scripts/clean-database.ts --force');
        process.exit(1);
    }

    console.log('⚠️  STARTING DATABASE CLEANUP (FULL WIPE) ⚠️');
    console.log('Keeping: Profiles ONLY');
    console.log('Deleting: Everything else (Estates, Plots, Business Data)\n');

    // Delete tables in dependency order (children first, parents last)

    // 1. Payment-related tables (most dependent)
    console.log('🗑️  Deleting payment_installment_links...');
    const { error: err1 } = await supabase.from('payment_installment_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err1 && err1.code !== 'PGRST116') console.error('Error:', err1.message);

    console.log('🗑️  Deleting payment_plan_installments...');
    const { error: err2 } = await supabase.from('payment_plan_installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err2 && err2.code !== 'PGRST116') console.error('Error:', err2.message);

    console.log('🗑️  Deleting payments...');
    const { error: err3 } = await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err3) console.error('Error:', err3.message);

    console.log('🗑️  Deleting payment_plans...');
    const { error: err4 } = await supabase.from('payment_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err4) console.error('Error:', err4.message);

    // 2. Commission-related tables
    console.log('🗑️  Deleting commission_history...');
    const { error: err5 } = await supabase.from('commission_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err5 && err5.code !== 'PGRST116') console.error('Error:', err5.message);

    // 3. Allocations (depends on customers, plots)
    console.log('🗑️  Deleting allocations...');
    const { error: err6 } = await supabase.from('allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err6) console.error('Error:', err6.message);

    // 4. Plots (depends on estates)
    console.log('🗑️  Deleting plots...');
    const { error: err7 } = await supabase.from('plots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err7) console.error('Error:', err7.message);

    // 5. Customers
    console.log('🗑️  Deleting customers...');
    const { error: err8 } = await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err8) console.error('Error:', err8.message);

    // 6. Leads
    console.log('🗑️  Deleting leads...');
    const { error: err9 } = await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err9 && err9.code !== 'PGRST116') console.error('Error:', err9.message);

    // 7. Agents
    console.log('🗑️  Deleting agents...');
    const { error: err10 } = await supabase.from('agents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err10 && err10.code !== 'PGRST116') console.error('Error:', err10.message);

    // 8. Communication tables
    console.log('🗑️  Deleting scheduled_communications...');
    const { error: err11 } = await supabase.from('scheduled_communications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err11 && err11.code !== 'PGRST116') console.error('Error:', err11.message);

    console.log('🗑️  Deleting communication_logs...');
    const { error: err12 } = await supabase.from('communication_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err12 && err12.code !== 'PGRST116') console.error('Error:', err12.message);

    // 9. CRM interactions
    console.log('🗑️  Deleting crm_interactions...');
    const { error: err13 } = await supabase.from('crm_interactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err13 && err13.code !== 'PGRST116') console.error('Error:', err13.message);

    // 10. Tasks
    console.log('🗑️  Deleting tasks...');
    const { error: err14 } = await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err14 && err14.code !== 'PGRST116') console.error('Error:', err14.message);

    // 11. Notifications
    console.log('🗑️  Deleting notifications...');
    const { error: err15 } = await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err15 && err15.code !== 'PGRST116') console.error('Error:', err15.message);

    // 12. Audit logs
    console.log('🗑️  Deleting audit_logs...');
    const { error: err16 } = await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err16 && err16.code !== 'PGRST116') console.error('Error:', err16.message);

    // 13. Estates (Now being deleted too)
    console.log('🗑️  Deleting estates...');
    const { error: err17 } = await supabase.from('estates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err17) console.error('Error deleting estates:', err17.message);

    console.log('\n✅ Cleanup Complete!');
    console.log('📊 Preserved: Profiles only');
    console.log('🗑️  Cleared: All business data including Estates & Plots');
}

main();
