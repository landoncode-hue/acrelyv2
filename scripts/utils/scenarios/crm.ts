
import { SupabaseClient } from "@supabase/supabase-js";
import { generateRandomString } from "../test-utils";

export async function testLeadsAndCustomers(staffClient: SupabaseClient) {
    console.log("\n👥 [TEST] CRM (Leads & Customers)");

    const suffix = generateRandomString();

    // 1. Create Lead
    const leadData = {
        full_name: `Lead ${suffix}`,
        email: `lead_${suffix}@example.com`,
        phone: `080${Math.floor(Math.random() * 100000000)}`,
        source: 'Instagram',
        interest: 'Land'
    };

    const { data: lead, error: leadError } = await staffClient
        .from('leads')
        .insert(leadData)
        .select()
        .single();

    if (leadError) throw new Error(`Create Lead Failed: ${leadError.message}`);
    console.log(`   ✅ Created Lead: ${lead.full_name}`);

    // 2. Convert to Customer
    // Simulating "Conversion" by creating a customer record with reference (if schema supported it, but we just create customer)
    const customerData = {
        full_name: `Customer ${suffix}`,
        email: `customer_${suffix}@example.com`,
        phone: leadData.phone,
        address: '123 Test St, Lagos',
        occupation: 'Tester'
    };

    const { data: customer, error: custError } = await staffClient
        .from('customers')
        .insert(customerData)
        .select()
        .single();

    if (custError) throw new Error(`Create Customer Failed: ${custError.message}`);
    console.log(`   ✅ Created/Converted Customer: ${customer.full_name} (${customer.id})`);

    return customer;
}
