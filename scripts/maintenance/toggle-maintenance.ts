import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function toggleMaintenance(enabled: boolean, message: string = 'The system is currently undergoing maintenance. Please check back later.') {
    console.log(`${enabled ? 'Enabling' : 'Disabling'} maintenance mode...`);

    const { error } = await supabase
        .from('system_settings')
        .upsert({
            key: 'maintenance_mode',
            value: { enabled, message },
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error updating maintenance mode:', error);
        process.exit(1);
    }

    console.log(`Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully.`);
}

const args = process.argv.slice(2);
const command = args[0];
const customMessage = args[1];

if (command === 'enable') {
    toggleMaintenance(true, customMessage);
} else if (command === 'disable') {
    toggleMaintenance(false);
} else {
    console.log('Usage: npx tsx scripts/maintenance/toggle-maintenance.ts [enable|disable] "Optional Message"');
}
