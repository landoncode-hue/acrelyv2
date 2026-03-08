import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function verify() {
    console.log('=== DATABASE STATE VERIFICATION ===\n');

    // Estates
    const { data: estates, count: estateCount } = await supabase.from('estates').select('name, location, price', { count: 'exact' });
    console.log(`ESTATES (${estateCount}):`);
    estates?.forEach(e => console.log(`  - ${e.name} | ${e.location} | ₦${e.price?.toLocaleString()}`));

    // Users
    const { data: users } = await supabase.auth.admin.listUsers();
    console.log(`\nUSERS (${users.users.length}):`);
    users.users.forEach(u => console.log(`  - ${u.email}`));

    // Check for customer data
    const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    const { count: allocationCount } = await supabase.from('allocations').select('*', { count: 'exact', head: true });
    const { count: paymentCount } = await supabase.from('payments').select('*', { count: 'exact', head: true });

    console.log(`\nDATA TABLES:`);
    console.log(`  - Customers: ${customerCount || 0}`);
    console.log(`  - Allocations: ${allocationCount || 0}`);
    console.log(`  - Payments: ${paymentCount || 0}`);

    if ((customerCount || 0) === 0 && (allocationCount || 0) === 0 && (paymentCount || 0) === 0) {
        console.log('\n✅ Database is clean - only estates and users exist.');
    } else {
        console.log('\n⚠️ Database has customer/allocation/payment data.');
    }
}

verify();
