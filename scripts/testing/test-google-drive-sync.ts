#!/usr/bin/env tsx

/**
 * Test Google Drive Backup Sync
 * 
 * This script tests the Google Drive sync functionality by:
 * 1. Verifying Google Drive credentials
 * 2. Testing OAuth token refresh
 * 3. Uploading a test file
 * 4. Verifying the upload
 * 5. Cleaning up test file
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

interface GoogleDriveConfig {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    folderId: string;
}

async function getAccessToken(config: GoogleDriveConfig): Promise<string> {
    const tokenUrl = "https://oauth2.googleapis.com/token";

    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            refresh_token: config.refreshToken,
            grant_type: "refresh_token",
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
}

async function uploadTestFile(
    accessToken: string,
    folderId: string,
    fileName: string,
    content: string
): Promise<string> {
    const metadata = {
        name: fileName,
        parents: [folderId],
    };

    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata);

    const dataPart = delimiter +
        "Content-Type: text/plain\r\n\r\n" +
        content;

    const multipartBody = metadataPart + dataPart + closeDelimiter;

    const uploadUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

    const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload: ${error}`);
    }

    const result = await response.json();
    return result.id;
}

async function deleteFile(accessToken: string, fileId: string): Promise<void> {
    const deleteUrl = `https://www.googleapis.com/drive/v3/files/${fileId}`;

    const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok && response.status !== 404) {
        const error = await response.text();
        throw new Error(`Failed to delete: ${error}`);
    }
}

async function testGoogleDriveSync() {
    console.log('🧪 Testing Google Drive Backup Sync\n');

    try {
        // 1. Load configuration
        console.log('1. Loading configuration...');
        const config: GoogleDriveConfig = {
            clientId: process.env.GOOGLE_DRIVE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || '',
            refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '',
            folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
        };

        if (!config.clientId || !config.clientSecret || !config.refreshToken || !config.folderId) {
            throw new Error('Missing Google Drive configuration. Please set environment variables.');
        }

        console.log('   ✓ Configuration loaded');
        console.log(`   Client ID: ${config.clientId.substring(0, 20)}...`);
        console.log(`   Folder ID: ${config.folderId}\n`);

        // 2. Test OAuth token refresh
        console.log('2. Testing OAuth token refresh...');
        const accessToken = await getAccessToken(config);
        console.log('   ✓ Access token obtained\n');

        // 3. Upload test file
        console.log('3. Uploading test file...');
        const testFileName = `acrely_test_backup_${Date.now()}.txt`;
        const testContent = `Acrely Backup Test\nTimestamp: ${new Date().toISOString()}\nThis is a test file to verify Google Drive sync.`;

        const fileId = await uploadTestFile(accessToken, config.folderId, testFileName, testContent);
        console.log(`   ✓ Test file uploaded`);
        console.log(`   File ID: ${fileId}\n`);

        // 4. Verify upload
        console.log('4. Verifying upload...');
        const verifyUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,size,createdTime`;
        const verifyResponse = await fetch(verifyUrl, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });

        if (!verifyResponse.ok) {
            throw new Error('Failed to verify upload');
        }

        const fileInfo = await verifyResponse.json();
        console.log('   ✓ File verified in Google Drive');
        console.log(`   Name: ${fileInfo.name}`);
        console.log(`   Size: ${fileInfo.size} bytes`);
        console.log(`   Created: ${fileInfo.createdTime}\n`);

        // 5. Cleanup
        console.log('5. Cleaning up test file...');
        await deleteFile(accessToken, fileId);
        console.log('   ✓ Test file deleted\n');

        console.log('✅ All tests passed!');
        console.log('\nGoogle Drive sync is configured correctly.');
        console.log('You can now deploy the sync-to-google-drive edge function.\n');

    } catch (error: any) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Verify all environment variables are set in .env.local');
        console.error('2. Check that the refresh token is valid');
        console.error('3. Ensure the folder ID is correct');
        console.error('4. Verify Google Drive API is enabled in Google Cloud Console\n');
        process.exit(1);
    }
}

// Run test
testGoogleDriveSync();
