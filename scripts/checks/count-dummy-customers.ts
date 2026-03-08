
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('Checking for customers with dummy phone numbers (+234000...)...');

    // Count customers whose phone starts with +234000
    // Note: supabase-js 'like' filter uses standard SQL pattern matching
    const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .ilike('phone', '+234000%');

    if (error) {
        console.error('Error fetching count:', error);
        return;
    }

    console.log(`\nFound ${count} customers with dummy phone numbers.`);

    // Also get total count for context
    const { count: total, error: tErr } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

    if (!tErr) {
        console.log(`Total customers: ${total}`);
        if (total && count) {
            console.log(`Percentage: ${((count / total) * 100).toFixed(1)}%`);
        }
    }
}

main().catch(console.error);
