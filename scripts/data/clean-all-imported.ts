
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

async function cleanAll() {
    console.log('🧹 Cleaning All Imported Allocations (Today)...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split('T')[0];

    // Select Allocations to delete
    const { data: allocations } = await supabase
        .from('allocations')
        .select('id')
        .eq('status', 'draft')
        .gt('created_at', `${today}T00:00:00.000Z`);

    if (!allocations || allocations.length === 0) {
        console.log("Nothing to delete.");
        return;
    }

    const ids = allocations.map(a => a.id);
    console.log(`Found ${ids.length} allocations. Deleting associated payments first...`);

    // Delete Payments
    // Chunking to avoid large query limits if necessary, but 200 should be fine.
    const { error: payError } = await supabase.from('payments').delete().in('allocation_id', ids);
    if (payError) {
        console.error("❌ Payment Delete error:", payError);
        return; // Don't proceed if payments failed
    }

    // Delete Allocations
    console.log("Deleting allocations...");
    const { error: allocError } = await supabase.from('allocations').delete().in('id', ids);

    if (allocError) console.error("❌ Allocation Delete failed:", allocError);
    else console.log("✅ Cleanup Successful.");
}

cleanAll();
