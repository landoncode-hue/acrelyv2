import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyCleanup() {
    console.log('🔍 Verifying cleanup...');

    // 1. Check Estates
    const { count: estateCount } = await supabase.from('estates').select('*', { count: 'exact', head: true });
    console.log(`Estates count: ${estateCount} (Should be 0)`);

    // 2. Check Customers
    const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    console.log(`Customers count: ${customerCount} (Should be 0)`);

    // 3. Check Profiles
    const { data: profiles, error } = await supabase.from('profiles').select('email, role');
    if (error) {
        console.error('Error fetching profiles:', error);
    } else {
        console.log('\nRemaining Profiles:');
        profiles?.forEach(p => console.log(`- ${p.email} (${p.role})`));

        const customersRemaining = profiles?.filter(p => p.role === 'customer').length;
        console.log(`\nCustomer profiles remaining: ${customersRemaining} (Should be 0)`);
    }
}

verifyCleanup();
