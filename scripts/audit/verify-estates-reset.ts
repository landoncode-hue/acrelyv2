import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function verify() {
    const { data: estate } = await supabase
        .from('estates')
        .select('*, plots(count)')
        .eq('name', 'City of David Estate')
        .single();

    console.log('Estate Verification:', estate);

    const { count } = await supabase
        .from('estates')
        .select('*', { count: 'exact', head: true });

    console.log('Total Estates:', count);
}

verify();
