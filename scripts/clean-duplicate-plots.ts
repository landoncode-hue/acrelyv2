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

async function cleanDuplicatePlots() {
    console.log("Cleaning up duplicate integer plots for all estates...");

    // Find all plot numbers that are purely numbers (legacy format)
    // Instead of complex regex in select, we can fetch all plots and delete those without 'P-' prefix

    const { data: estates, error: estateErr } = await supabase.from('estates').select('id');
    if (estateErr || !estates) {
        console.error("Failed to fetch estates:", estateErr);
        return;
    }

    for (const estate of estates) {
        const { data: plots } = await supabase.from('plots').select('id, plot_number').eq('estate_id', estate.id);
        if (plots) {
            const numericPlots = plots.filter(p => /^\d+$/.test(p.plot_number));
            if (numericPlots.length > 0) {
                const idsToDelete = numericPlots.map(p => p.id);
                console.log(`Found ${idsToDelete.length} bad numeric plots in estate ${estate.id}, deleting...`);
                const { error: delErr } = await supabase.from('plots').delete().in('id', idsToDelete).eq('status', 'available');
                if (delErr) {
                    console.error("Failed deleting plots:", delErr);
                } else {
                    console.log("Success.");

                    // Update total plots
                    const newTotal = plots.length - numericPlots.length;
                    await supabase.from('estates').update({ total_plots: newTotal, available_plots: newTotal }).eq('id', estate.id);
                }
            }
        }
    }
}

cleanDuplicatePlots();
