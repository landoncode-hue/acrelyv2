
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log("🔍 Verifying latest allocations and payments...");

    const { data: allocations, error: aError } = await supabase
        .from("allocations")
        .select(`
            id,
            allocation_date,
            customer_facing_name,
            customers (full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(2);

    if (aError) {
        console.error("Error fetching allocations:", aError);
        return;
    }

    console.log("\n--- Allocations ---");
    allocations.forEach(a => {
        console.log(`Customer: ${(a.customers as any)?.full_name}`);
        console.log(`Plot: ${a.customer_facing_name}`);
        console.log(`Allocation Date: ${a.allocation_date}`);
        console.log("-------------------");
    });

    const { data: payments, error: pError } = await supabase
        .from("payments")
        .select(`
            id,
            payment_date,
            amount,
            allocation_id
        `)
        .order("created_at", { ascending: false })
        .limit(2);

    if (pError) {
        console.error("Error fetching payments:", pError);
        return;
    }

    console.log("\n--- Payments ---");
    payments.forEach(p => {
        console.log(`Amount: ${p.amount}`);
        console.log(`Payment Date: ${p.payment_date}`);
        console.log(`Allocation ID: ${p.allocation_id}`);
        console.log("-------------------");
    });
}

verify();
