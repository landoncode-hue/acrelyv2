import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAssets() {
    const files = ['pinnacle-logo.png', 'acrely-logo.png', 'company-logo.png'];

    console.log('Checking assets in "avatars" bucket...');

    for (const file of files) {
        const { data, error } = await supabase.storage
            .from('avatars')
            .list('', { search: file });

        if (data && data.length > 0) {
            console.log(`[FOUND] ${file}`);
        } else {
            console.log(`[MISSING] ${file}`);
        }
    }
}

checkAssets();
