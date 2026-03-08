
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    console.log('🧹 Starting cleanup of test data...');

    const patterns = ['%@test.com', '%@example.com'];
    let totalDeleted = 0;

    for (const pattern of patterns) {
        console.log(`\nSearching for profiles matching: ${pattern}`);

        // 1. Find the profiles first to get their IDs
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .ilike('email', pattern);

        if (error) {
            console.error(`Error finding profiles for ${pattern}:`, error.message);
            continue;
        }

        if (!profiles || profiles.length === 0) {
            console.log('No matching profiles found.');
            continue;
        }

        console.log(`Found ${profiles.length} profiles to delete:`);
        profiles.forEach(p => console.log(` - ${p.email} (${p.id})`));

        // 2. Delete from Auth (which cascades to profiles)
        for (const profile of profiles) {
            const { error: deleteError } = await supabase.auth.admin.deleteUser(profile.id);

            if (deleteError) {
                console.error(`❌ Failed to delete user ${profile.email}:`, deleteError.message);
            } else {
                console.log(`✅ Deleted user: ${profile.email}`);
                totalDeleted++;
            }
        }
    }

    console.log(`\n✨ Cleanup complete. Total records deleted: ${totalDeleted}`);
}

main().catch(console.error);
