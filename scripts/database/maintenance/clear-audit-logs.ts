
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function clearAuditLogs() {
    console.log('🚧 Clearing Audit Logs...');
    console.log('Target: ', supabaseUrl);

    try {
        const { error, count } = await supabase
            .from('audit_logs')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (error) {
            console.error('❌ Failed to clear logs:', error.message);
        } else {
            console.log('✅ Audit Logs Cleared successfully!');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

clearAuditLogs();
