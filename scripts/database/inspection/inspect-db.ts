
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function main() {
    console.log('Inspecting DB...');

    // 1. Get is_staff definition
    const { data: funcs, error: fError } = await adminClient.rpc('get_function_def', { func_name: 'is_staff' });
    // Verify RPC call manually via SQL if needed, but let's try raw query via pg_proc?
    // Admin client cannot run arbitrary SQL unless via RPC.

    // Attempt to invoke is_staff
    const { data: ret, error: rError } = await adminClient.rpc('is_staff');
    console.log('is_staff result (as admin):', ret);
    console.log('is_staff error:', rError);

    // 2. We can try to infer definition by behavior.

    // Let's print policies if possible (not via API).

    console.log('Done.');
}

main().catch(console.error);
