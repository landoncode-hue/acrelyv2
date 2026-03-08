import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log('Checking estate images...');
    const { data: estates } = await supabase
        .from('estates')
        .select('id, name, image_urls')
        .or('name.ilike.%New Era%,name.ilike.%Ose Perfection%');

    if (estates) {
        estates.forEach(e => {
            console.log(`Estate: ${e.name}`);
            console.log(`  Images: ${JSON.stringify(e.image_urls)}`);
        });
    }
}

main();
