import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const UPDATES = [
    {
        namePattern: '%New Era%',
        images: [
            'https://images.unsplash.com/photo-1600596542815-6ad4c727dd2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // Modern home with pool
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
        ]
    },
    {
        namePattern: '%Ose Perfection%',
        images: [
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // Beautiful luxury home
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
        ]
    }
];

async function main() {
    console.log('Updating estate images...');

    for (const update of UPDATES) {
        // Find the estate first to get ID
        const { data: estates } = await supabase
            .from('estates')
            .select('id, name')
            .ilike('name', update.namePattern);

        if (estates && estates.length > 0) {
            for (const estate of estates) {
                console.log(`Updating images for: ${estate.name} (${estate.id})`);
                const { error } = await supabase
                    .from('estates')
                    .update({ image_urls: update.images })
                    .eq('id', estate.id);

                if (error) console.error('Error updating:', error);
                else console.log('Update successful.');
            }
        } else {
            console.log(`No estate matched pattern: ${update.namePattern}`);
        }
    }
}

main();
