import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    const { data, error, count } = await supabase
        .from('estates')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching estates:', error);
    } else {
        console.log(`Found ${count} estates.`);
        if (data && data.length > 0) {
            console.log('Sample Estate:', data[0]);
            // Check specific legacy estate
            const legacyEstates = data.filter(e => e.name.toUpperCase().includes('NEW ERA'));
            console.log(`Found ${legacyEstates.length} matching 'NEW ERA'`);

            for (const leg of legacyEstates) {
                console.log('Estate:', leg);
                const { count: plotCount } = await supabase
                    .from('plots')
                    .select('*', { count: 'exact', head: true })
                    .eq('estate_id', leg.id);
                console.log(`  Plots for this estate ID (${leg.id}): ${plotCount}`);
            }
        }
    }
}

main();
