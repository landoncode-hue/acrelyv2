import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log('Checking distinct plot statuses...');
    const { data, error } = await supabase
        .from('plots')
        .select('status');

    if (error) {
        console.error('Error:', error);
        return;
    }

    // Manual distinct count since Select Distinct is annoying in JS client sometimes
    const counts: Record<string, number> = {};
    data.forEach(p => {
        counts[p.status] = (counts[p.status] || 0) + 1;
    });

    console.log('Plot Status Counts:', counts);
}

main();
