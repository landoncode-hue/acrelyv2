
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function clearInventory() {
    console.log('🚧 Clearing Inventory...');

    try {
        console.log('Deleting Plots...');
        // Delete all plots
        const { error: plotsError } = await supabase.from('plots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (plotsError) console.error('Error deleting plots:', plotsError.message);

        console.log('Deleting Estates...');
        // Delete all estates
        const { error: estatesError } = await supabase.from('estates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (estatesError) console.error('Error deleting estates:', estatesError.message);

        console.log('✅ Inventory Cleared!');
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

clearInventory();
