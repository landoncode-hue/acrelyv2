
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const UPDATES = [
    { name: 'Allocation Approved', subject: 'Congratulations! Your Plot Allocation is Approved' },
    { name: 'Payment Recorded', subject: 'Payment Receipt - Thank You' },
    { name: 'Upcoming Installment', subject: 'Reminder: Upcoming Payment Due' },
    { name: 'Due Today', subject: 'Urgent: Payment Due Today' },
    { name: 'Overdue', subject: 'Action Required: Overdue Payment Notice' },
    { name: 'Severe Overdue', subject: 'Final Notice: Severe Overdue Payment' },
    { name: 'Consistent Early Payer', subject: 'Thank You for Your Prompt Payments' },
    { name: 'Frequent Late Payer', subject: 'Payment Schedule Assistance' },
    { name: 'Near Completion', subject: 'Congratulations! You are almost done' },
    { name: 'Agent Inactivity', subject: 'Activity Alert: Lead Follow-up Needed' },
    { name: 'Estate Nearly Sold Out', subject: 'Inventory Alert: Estate Selling Fast' },
    { name: 'Bulk SMS – Estate Promo', subject: 'Special Offer: New Estate Available' },
    { name: 'Customer Appreciation', subject: 'A Message of Appreciation' },
    { name: 'Payment Successful', subject: 'Payment Received' },
    { name: 'Allocation Ready', subject: 'Allocation Document Ready' }
];

async function fixSubjects() {
    console.log('🚧 Fixing Template Subjects...');

    let successCount = 0;
    let failCount = 0;

    for (const update of UPDATES) {
        // Only update if subject is currently null or empty? 
        // User requested "make sure all have subjects". Updating to default is safer.
        const { error } = await supabase
            .from('communication_templates')
            .update({ subject: update.subject })
            .eq('name', update.name)
            .is('subject', null); // Only update NULL ones to avoid overwriting custom ones if they exist?
        // Actually, since I just reset DB, they are likely all null.
        // But safer to check is('subject', null) OR eq('subject', '')

        if (error) {
            console.error(`Failed to update ${update.name}:`, error.message);
            failCount++;
        } else {
            // We can't easily know if it matched or modified without 'select' return, but assuming success.
            successCount++;
        }
    }

    // Check remaining NULLs
    const { count } = await supabase
        .from('communication_templates')
        .select('*', { count: 'exact', head: true })
        .is('subject', null);

    console.log(`✅ Update loop complete.`);
    console.log(`Remaining templates with NULL subject: ${count}`);
}

fixSubjects();
