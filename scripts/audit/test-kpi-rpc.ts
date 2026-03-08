import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRPC() {
    // We need to impersonate a sysadmin to call this
    const sysadminEmail = 'sysadmin@pinnaclegroups.ng';

    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', sysadminEmail)
        .single();

    if (!profile) {
        console.error('SysAdmin profile not found');
        return;
    }

    // Since it's SECURITY DEFINER but checks auth.uid(), we might need to set the session
    // Or just test the SQL directly if we had a way.
    // In Supabase client, we'd need to log in or use a token.
    // However, we can also use the service role to call it but it might fail the role check in the function.

    // Let's try calling it.
    const { data, error } = await supabase.rpc('get_executive_kpis', {
        p_date_from: null,
        p_date_to: null
    });

    if (error) {
        console.error('RPC Error:', error);
    } else {
        console.log('RPC Result:', data);
    }
}

testRPC();
