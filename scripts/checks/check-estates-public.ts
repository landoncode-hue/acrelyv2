import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Use ANON key to simulate client-side access
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
    console.log('Testing with ANON key...');
    const { data, error, count } = await supabase
        .from('estates')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching estates:', error);
    } else {
        if (data) {
            console.log(`Found ${data.length} estates.`);
            data.forEach(e => {
                if (e.name.includes('New Era') || e.name.includes('Ose Perfection')) {
                    console.log(`Estate: ${e.name}`);
                    console.log(`  Images: ${JSON.stringify(e.image_urls)}`);
                }
            });
        } else {
            console.log('No estates found (RLS likely blocking).');
        }
    }
}

main();
