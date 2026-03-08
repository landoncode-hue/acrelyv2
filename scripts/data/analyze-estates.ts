import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function analyzeEstates() {
    console.log('📊 Analyzing Estate Data...\n');

    // Get all estates
    const { data: estates, error } = await supabase
        .from('estates')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching estates:', error);
        return;
    }

    console.log(`Found ${estates?.length || 0} estates:\n`);
    estates?.forEach((estate, idx) => {
        console.log(`${idx + 1}. ${estate.name}`);
        console.log(`   ID: ${estate.id}`);
        console.log(`   Location: ${estate.location || 'N/A'}`);
        console.log(`   Price: ₦${estate.price?.toLocaleString() || 'N/A'}`);
        console.log(`   Total Plots: ${estate.total_plots || 0}`);
        console.log(`   Occupied: ${estate.occupied_plots || 0}`);
        console.log(`   Available: ${estate.available_plots || 0}`);
        console.log('');
    });

    // Get customer count
    const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Total Customers: ${customerCount || 0}`);

    // Get allocation count
    const { count: allocationCount } = await supabase
        .from('allocations')
        .select('*', { count: 'exact', head: true });

    console.log(`📊 Total Allocations: ${allocationCount || 0}`);

    // Get payment count
    const { count: paymentCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true });

    console.log(`📊 Total Payments: ${paymentCount || 0}`);

    // Get plot count
    const { count: plotCount } = await supabase
        .from('plots')
        .select('*', { count: 'exact', head: true });

    console.log(`📊 Total Plots: ${plotCount || 0}`);
}

analyzeEstates();
