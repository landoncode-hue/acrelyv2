
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkDimensions() {
    const { data, error } = await supabase
        .from('plots')
        .select('*')
        .not('dimensions', 'is', null)
        .limit(10);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Plots with Dimensions:', data);
        if (data.length === 0) console.log('No plots with dimensions found.');
    }
}

checkDimensions();
