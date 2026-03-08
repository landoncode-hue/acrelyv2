
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function setupTest() {
    // 1. Get a customer
    const { data: customer } = await supabase.from("customers").select("id").limit(1).single();
    if (!customer) throw new Error("No customer found");

    // 2. Get an estate with available plots
    const { data: estate } = await supabase.from("estates").select("id, price").limit(1).single();
    if (!estate) throw new Error("No estate found");

    // 3. Create Draft Allocation
    const { data: allocation, error } = await supabase.from("allocations").insert({
        customer_id: customer.id,
        estate_id: estate.id,
        plot_id: null, // Intentionally null for assignment test
        status: 'draft',
        notes: 'Test allocation for browser verification',
        plan_type: 'outright',
        plot_size: 'full_plot'
    }).select().single();

    if (error) console.error(error);
    else console.log(`Created allocation: ${allocation.id}`);
}

setupTest();
