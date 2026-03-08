
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function main() {
    console.log('Verifying is_staff recursion fix...');

    // Create user with metadata logic
    const testEmail = `verify_meta_${Date.now()}@test.com`;
    const { data: auth, error: cError } = await adminClient.auth.admin.createUser({
        email: testEmail,
        password: 'password123',
        email_confirm: true,
        user_metadata: { role: 'frontdesk' }
    });
    if (cError) throw cError;
    const userId = auth.user!.id; // Handle possible null if error (but asserted above)

    // Ensure NO PROFILE exists (delete if trigger created it)
    await adminClient.from('profiles').delete().eq('id', userId);

    console.log('Created user with metadata (role=frontdesk) and NO profile.');

    // Login
    const client = createClient(supabaseUrl, anonKey);
    const { error: sError } = await client.auth.signInWithPassword({ email: testEmail, password: 'password123' });
    if (sError) throw sError;

    // Call is_staff
    const { data: isStaff, error: rpcError } = await client.rpc('is_staff');

    console.log('is_staff result:', isStaff);
    console.log('is_staff error:', rpcError);

    if (isStaff === true) {
        console.log('SUCCESS: is_staff is reading from metadata (auth.users). Fix applied.');
    } else {
        console.log('FAILURE: is_staff returned false (or error). It likely relies on profiles.');
    }

    // 3. Inspect allocations table columns
    const { data: cols, error: cError } = await adminClient.rpc('get_allocations_columns'); // Need custom function?
    // Or just query:
    const { data: allocs, error: aError } = await adminClient.from('allocations').select('*').limit(0);
    // This gives empty array but maybe not keys if 0 rows?
    // Insert a dummy row and select it? No constraints.

    // Better: Query information_schema via RPC if possible.
    // Or just try to Select agent_id.
    const { error: sError } = await adminClient.from('allocations').select('agent_id').limit(1);
    console.log('Select agent_id error:', sError);

}

main().catch(console.error);
