import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function verifyDatesAndPhones() {
    console.log('🕵️‍♂️ Verifying import quality...');

    // 1. Check for Historical Dates (creation should NOT be today)
    const today = new Date().toISOString().split('T')[0];
    const { data: customers } = await supabase.from('customers').select('created_at, phone').limit(10);

    let historicalCount = 0;
    let dummyCount = 0;

    if (customers) {
        console.log('\nSample Customers:');
        customers.forEach(c => {
            const dateOnly = c.created_at.split('T')[0];
            const isHistorical = dateOnly !== today;
            const isDummy = c.phone && c.phone.startsWith('+2340000');

            console.log(` - Created: ${dateOnly} (Historical: ${isHistorical}) | Phone: ${c.phone} (Dummy: ${isDummy})`);

            if (isHistorical) historicalCount++;
            if (isDummy) dummyCount++;
        });
    }

    // 2. Check Allocation Dates
    const { data: allocations } = await supabase.from('allocations').select('allocation_date').limit(10);
    if (allocations) {
        console.log('\nSample Allocations:');
        allocations.forEach(a => {
            const dateOnly = a.allocation_date.split('T')[0];
            const isHistorical = dateOnly !== today;
            console.log(` - Alloc Date: ${dateOnly} (Historical: ${isHistorical})`);
        });
    }
}

verifyDatesAndPhones();
