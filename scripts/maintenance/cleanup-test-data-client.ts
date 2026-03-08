import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanupTestData() {
    console.log('🧹 Starting Test Data Cleanup...');

    // 1. Cleanup Customers
    console.log('Cleaning up test customers...');
    const { data: customers, error: cError } = await supabase
        .from('customers')
        .delete()
        .or('full_name.ilike.%test%,full_name.ilike.%demo%,email.ilike.%@test.%,email.ilike.%@example.co%,email.ilike.%@localhost%');

    if (cError) {
        console.error('Error cleaning up customers:', cError);
    } else {
        console.log('✅ Test customers cleaned up.');
    }

    // 2. Cleanup Estates
    console.log('Cleaning up test estates...');
    const { data: estates, error: eError } = await supabase
        .from('estates')
        .delete()
        .or('name.ilike.test%,name.ilike.%demo%');

    if (eError) {
        console.error('Error cleaning up estates:', eError);
    } else {
        console.log('✅ Test estates cleaned up.');
    }

    // 3. Cleanup Leads
    console.log('Cleaning up test leads...');
    const { data: leads, error: lError } = await supabase
        .from('leads')
        .delete()
        .or('full_name.ilike.%test%,full_name.ilike.%demo%,email.ilike.%@test.%,email.ilike.%@example.co%');

    if (lError) {
        console.error('Error cleaning up leads:', lError);
    } else {
        console.log('✅ Test leads cleaned up.');
    }

    console.log('✨ Cleanup complete!');
}

cleanupTestData().then(() => process.exit(0)).catch(err => {
    console.error('Cleanup failed:', err);
    process.exit(1);
});
