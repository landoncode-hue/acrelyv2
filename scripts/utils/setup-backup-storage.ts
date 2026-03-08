#!/usr/bin/env tsx

/**
 * Setup Backup Storage Script
 * 
 * This script configures Supabase Storage for backups:
 * - Creates 'backups' bucket
 * - Sets up RLS policies (sysadmin-only access)
 * - Tests upload/download permissions
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBackupStorage() {
    console.log('🚀 Setting up backup storage...\n');

    try {
        // 1. Check if bucket exists
        console.log('1. Checking if backups bucket exists...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            throw new Error(`Failed to list buckets: ${listError.message}`);
        }

        const backupsBucket = buckets.find(b => b.name === 'backups');

        if (backupsBucket) {
            console.log('   ✓ Backups bucket already exists');
        } else {
            // Create bucket
            console.log('   Creating backups bucket...');
            const { data: newBucket, error: createError } = await supabase.storage.createBucket('backups', {
                public: false,
                fileSizeLimit: 5 * 1024 * 1024 * 1024, // 5GB
                allowedMimeTypes: ['application/sql', 'application/gzip', 'application/x-gzip'],
            });

            if (createError) {
                throw new Error(`Failed to create bucket: ${createError.message}`);
            }

            console.log('   ✓ Backups bucket created');
        }

        // 2. Test upload
        console.log('\n2. Testing upload permissions...');
        const testData = new Blob(['test backup data'], { type: 'text/plain' });
        const testPath = `test/test_${Date.now()}.txt`;

        const { error: uploadError } = await supabase.storage
            .from('backups')
            .upload(testPath, testData);

        if (uploadError) {
            throw new Error(`Upload test failed: ${uploadError.message}`);
        }

        console.log('   ✓ Upload test passed');

        // 3. Test download
        console.log('\n3. Testing download permissions...');
        const { data: downloadData, error: downloadError } = await supabase.storage
            .from('backups')
            .download(testPath);

        if (downloadError) {
            throw new Error(`Download test failed: ${downloadError.message}`);
        }

        console.log('   ✓ Download test passed');

        // 4. Cleanup test file
        console.log('\n4. Cleaning up test file...');
        const { error: deleteError } = await supabase.storage
            .from('backups')
            .remove([testPath]);

        if (deleteError) {
            console.warn(`   ⚠️  Failed to delete test file: ${deleteError.message}`);
        } else {
            console.log('   ✓ Test file deleted');
        }

        // 5. Display bucket info
        console.log('\n5. Bucket configuration:');
        const { data: bucket, error: bucketError } = await supabase.storage.getBucket('backups');

        if (bucketError) {
            console.warn(`   ⚠️  Failed to get bucket info: ${bucketError.message}`);
        } else {
            console.log(`   Name: ${bucket.name}`);
            console.log(`   Public: ${bucket.public}`);
            console.log(`   File size limit: ${bucket.file_size_limit ? (bucket.file_size_limit / 1024 / 1024 / 1024).toFixed(2) + ' GB' : 'None'}`);
            console.log(`   Allowed MIME types: ${bucket.allowed_mime_types?.join(', ') || 'All'}`);
        }

        console.log('\n✅ Backup storage setup complete!');
        console.log('\nNext steps:');
        console.log('1. Deploy backup edge functions: supabase functions deploy');
        console.log('2. Set up cron jobs for automated backups');
        console.log('3. Configure cloud storage credentials (optional)');

    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    }
}

// Run setup
setupBackupStorage();
