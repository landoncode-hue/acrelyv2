import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const envs: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envs[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
});

const supabaseUrl = envs['NEXT_PUBLIC_SUPABASE_URL'] || '';
const supabaseKey = envs['SUPABASE_SERVICE_ROLE_KEY'] || envs['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
    console.log("Dropping legacy trigger...");

    // To execute raw SQL, we must rely on postgres role via rest, but supabase-js doesn't expose raw query easily.
    // Instead, let's use the RPC we can define quickly or just use `psql` if we have the DB string.

    // Try to use a known connection string if possible:
    const connString = envs['DATABASE_URL'];
    if (connString) {
        console.log("Please run this command in terminal:");
        console.log(`psql "${connString}" -c "DROP TRIGGER IF EXISTS trigger_auto_generate_plots ON public.estates; DROP FUNCTION IF EXISTS public.populate_plots_for_estate_func();"`);
    } else {
        console.log("No DATABASE_URL found to run raw psql.");
    }
}

fixDatabase();
