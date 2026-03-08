
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function removeAllCustomers() {
    console.log("🔥 Removing ALL Customers...");

    // Check count before
    const { count: beforeCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    console.log(`Found ${beforeCount} customers.`);

    if (beforeCount === 0) {
        console.log("✅ No customers to remove.");
        return;
    }

    // Delete All
    // Using simple delete with no filter (gte 0 usually works for 'all' if no where clause allowed, but Supabase allows empty filter for delete?)
    // Supabase JS often requires a filter for delete to prevent accidents.
    // I'll use .neq('id', '00000000-0000-0000-0000-000000000000') or similar.

    const { error, count } = await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        console.error("Error deleting customers:", error.message);
    } else {
        console.log(`✅ Deleted customers (Count from response: ${count ?? 'Unknown'}).`);
    }

    // Verify
    const { count: afterCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    console.log(`Remaining customers: ${afterCount}`);
}

removeAllCustomers();
