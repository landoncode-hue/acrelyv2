import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fix() {
    const { data: users } = await supabase.auth.admin.listUsers();
    const customer = users?.users.find((u) => u.email === 'test.customer@example.com');
    if (!customer) {
        console.error('Customer user not found');
        return;
    }
    console.log('Customer auth ID:', customer.id);

    // Update customer record to set profile_id
    const { data, error } = await supabase
        .from('customers')
        .update({ profile_id: customer.id })
        .eq('id', customer.id)
        .select('id, email, full_name, profile_id, kyc_status');

    if (error) {
        console.error('Error updating customer:', error.message);
        return;
    }
    console.log('Updated customer record:', JSON.stringify(data, null, 2));
}

fix();
