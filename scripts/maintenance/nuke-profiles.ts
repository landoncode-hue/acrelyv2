
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function nukeProfiles() {
    console.log('☢️  Nuking Profiles (this might take a while)...');

    // 1. Audit Logs (Batch Delete)
    // We must delete audit logs first because of FK constraints.
    // Timeouts happen if we try to delete all at once.
    console.log('📜 Deleting Audit Logs in batches...');
    let totalLogsDeleted = 0;

    let retryCount = 0;

    while (true) {
        // Fetch a batch of IDs (small batch to keep it fast)
        const { data: logs, error: fetchError } = await supabase
            .from('audit_logs')
            .select('id')
            .limit(100); // reduced to 100

        if (fetchError) {
            console.error('❌ Error fetching audit logs:', fetchError.message);
            retryCount++;
            if (retryCount > 3) {
                console.error('❌ Too many fetch errors, aborting.');
                break;
            }
            await new Promise(r => setTimeout(r, 2000));
            continue;
        }

        retryCount = 0; // Reset on success

        if (!logs || logs.length === 0) {
            console.log('✅ Audit logs cleared.');
            break;
        }

        const ids = logs.map(l => l.id);
        const { error: deleteError } = await supabase
            .from('audit_logs')
            .delete()
            .in('id', ids);

        if (deleteError) {
            console.error('❌ Error deleting audit logs batch:', deleteError.message);
            // Wait slightly before retry to avoid thrashing
            await new Promise(r => setTimeout(r, 1000));
        } else {
            totalLogsDeleted += ids.length;
            process.stdout.write(`\rDeleted ${totalLogsDeleted} logs...`);
        }
    }
    console.log('\n');

    // 2. Delete Public Profiles
    // Now that audit logs (referencing profiles) are gone, we can delete profiles.
    console.log('👤 Deleting Profiles...');
    const { error: profilesError, count: profilesCount } = await supabase
        .from('profiles')
        .delete()
        .not('id', 'is', null); // Delete all

    if (profilesError) {
        console.error('❌ Error deleting profiles:', profilesError.message);
    } else {
        console.log('✅ Profiles table cleared.');
    }

    // 3. Delete Auth Users
    console.log('🔐 Deleting Auth Users...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Error listing users:', listError.message);
    } else {
        console.log(`Found ${users.length} Auth users to delete.`);
        let deletedUsers = 0;

        for (const user of users) {
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
            if (deleteError) {
                console.error(`⚠️ Failed to delete ${user.email}:`, deleteError.message);
            } else {
                deletedUsers++;
            }
        }
        console.log(`✅ Deleted ${deletedUsers}/${users.length} users.`);
    }

    console.log('✨ Cleanup Complete.');
}

nukeProfiles();
