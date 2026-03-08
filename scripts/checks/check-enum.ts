import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEnum() {
    console.log("Checking if 'partially_allocated' status is accepted...");

    // Attempt to select a plot and pretend to update it (rollback or check error)
    // Actually we can just inspect pg_enum if we had SQL access, but via JS client:
    // We'll try to update a test plot or just check if we can filter by it?
    // Filter by it is safe.

    const { error } = await supabase
        .from('plots')
        .select('id')
        .eq('status', 'partially_allocated')
        .limit(1);

    if (error) {
        console.log("Error querying partially_allocated:", error.message);
        if (error.message.includes("invalid input value")) {
            console.log("CONFIRMED: Enum value 'partially_allocated' DOES NOT EXIST.");
        }
    } else {
        console.log("Query for 'partially_allocated' status worked (Enum likely exists).");
    }

    // Double check by trying to update a non-existent ID to that status
    const { error: updateError } = await supabase
        .from('plots')
        .update({ status: 'partially_allocated' })
        .eq('id', '00000000-0000-0000-0000-000000000000'); // Dummy ID

    if (updateError) {
        console.log("Update check error:", updateError.message);
        if (updateError.message.includes("invalid input value")) {
            console.log("CONFIRMED: Enum value 'partially_allocated' DOES NOT EXIST.");
        }
    } else {
        console.log("Update check with dummy ID passed (Enum likely exists).");
    }
}

checkEnum();
