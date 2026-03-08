import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual dotenv loading
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

async function checkTriggers() {
    const { data, error } = await supabase.from('plots').select('plot_number, created_at, estate_id').eq('estate_id', '37620c23-174c-41bd-9c6b-cdeb3e715b19').order('plot_number', { ascending: true }).limit(200);
    console.log("All plots for the designated estate:");
    console.log(data?.map(d => d.plot_number).join(', '));
    console.log("Total Count:", data?.length);
    if (error) console.error("Error:", error);
}

checkTriggers();
