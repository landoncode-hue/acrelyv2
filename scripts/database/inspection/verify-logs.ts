
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkLogs() {
    const { count: auditCount } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true });
    // Check for customer portal sessions
    const { count: sessionCount } = await supabase.from('customer_portal_sessions').select('*', { count: 'exact', head: true });

    // Check if 'log_attempts' or similar exists?
    // Let's just check typical names
    console.log(`Audit Logs: ${auditCount}`);
    console.log(`Portal Sessions: ${sessionCount}`);
}

checkLogs();
