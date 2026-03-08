# Google Drive Backup Setup Guide

## Overview

This guide walks you through setting up Google Drive as your backup storage provider for Acrely. Backups will be automatically synced to a dedicated Google Drive folder.

---

## Prerequisites

- Google account
- Access to Google Cloud Console
- Supabase project with backup system deployed

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: "Acrely Backups"
4. Click "Create"

---

## Step 2: Enable Google Drive API

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click "Google Drive API"
4. Click "Enable"

---

## Step 3: Create OAuth 2.0 Credentials

### 3.1 Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have Google Workspace)
3. Click "Create"
4. Fill in required fields:
   - App name: "Acrely Backup System"
   - User support email: Your email
   - Developer contact: Your email
5. Click "Save and Continue"
6. Scopes: Click "Add or Remove Scopes"
   - Search for "Google Drive API"
   - Select: `https://www.googleapis.com/auth/drive.file`
   - Click "Update"
7. Click "Save and Continue"
8. Test users: Add your email
9. Click "Save and Continue"

### 3.2 Create OAuth Client ID

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Acrely Backup Client"
5. Authorized redirect URIs: `https://developers.google.com/oauthplayground`
6. Click "Create"
7. **Save the Client ID and Client Secret** (you'll need these)

---

## Step 4: Get Refresh Token

### 4.1 Use OAuth 2.0 Playground

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon (⚙️) in top right
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Client Secret
5. Close settings

### 4.2 Authorize API

1. In left panel, find "Drive API v3"
2. Select: `https://www.googleapis.com/auth/drive.file`
3. Click "Authorize APIs"
4. Sign in with your Google account
5. Click "Allow"

### 4.3 Get Refresh Token

1. Click "Exchange authorization code for tokens"
2. **Copy the Refresh Token** (you'll need this)

---

## Step 5: Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com)
2. Click "New" → "Folder"
3. Name: "Acrely Backups"
4. Right-click the folder → "Share"
5. Make sure you have access (owner)
6. Copy the Folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Example: If URL is `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`
   - Folder ID is: `1a2b3c4d5e6f7g8h9i0j`

---

## Step 6: Configure Supabase Environment Variables

1. Go to Supabase Dashboard → Edge Functions → Settings
2. Add the following environment variables:

```bash
GOOGLE_DRIVE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret-here
GOOGLE_DRIVE_REFRESH_TOKEN=your-refresh-token-here
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
```

---

## Step 7: Deploy Google Drive Sync Function

```bash
cd /Users/lordkay/Development/acrely
supabase functions deploy sync-to-google-drive
```

---

## Step 8: Test the Sync

### Manual Test

```bash
curl -X POST https://[YOUR-PROJECT-REF].supabase.co/functions/v1/sync-to-google-drive \
  -H "Authorization: Bearer [SERVICE-ROLE-KEY]" \
  -H "Content-Type: application/json"
```

### Check Google Drive

1. Go to your "Acrely Backups" folder in Google Drive
2. Verify backup files appear
3. Check file names match format: `acrely_backup_*.sql.gz`

---

## Step 9: Set Up Automated Sync

### Add Cron Job

```sql
SELECT cron.schedule(
  'google-drive-sync',
  '30 2 * * *',  -- 2:30 AM UTC daily (30 min after backup)
  $$
  SELECT net.http_post(
    url := 'https://[YOUR-PROJECT-REF].supabase.co/functions/v1/sync-to-google-drive',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);
```

---

## Monitoring

### Check Sync Status

```sql
-- View cloud sync status
SELECT 
  file_name,
  cloud_sync_status,
  metadata->>'google_drive_file_id' as drive_file_id,
  metadata->>'synced_at' as synced_at,
  created_at
FROM backup_logs
WHERE cloud_sync_status IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;
```

### Check for Failed Syncs

```sql
SELECT 
  file_name,
  metadata->>'sync_error' as error,
  metadata->>'last_sync_attempt' as last_attempt
FROM backup_logs
WHERE cloud_sync_status = 'failed'
ORDER BY created_at DESC;
```

---

## Troubleshooting

### Error: "Invalid refresh token"

**Solution**: Refresh token may have expired. Repeat Step 4 to get a new refresh token.

### Error: "Insufficient permissions"

**Solution**: 
1. Verify the scope `https://www.googleapis.com/auth/drive.file` is authorized
2. Re-authorize in OAuth Playground
3. Get new refresh token

### Error: "Folder not found"

**Solution**: 
1. Verify Folder ID is correct
2. Ensure the Google account used for OAuth has access to the folder
3. Check folder hasn't been deleted

### Files Not Appearing in Google Drive

**Solution**:
1. Check Edge Function logs in Supabase Dashboard
2. Verify environment variables are set correctly
3. Test manually with curl command
4. Check `backup_logs` table for sync errors

---

## Security Best Practices

1. **Rotate Credentials**: Refresh tokens periodically (every 6 months)
2. **Limit Scope**: Only use `drive.file` scope (not full Drive access)
3. **Monitor Access**: Regularly check Google account activity
4. **Backup Encryption**: Backups are compressed but not encrypted by default
5. **Access Control**: Restrict folder access to necessary accounts only

---

## Storage Management

### Google Drive Storage Limits

- **Free**: 15 GB shared across Gmail, Drive, Photos
- **Google One 100GB**: $1.99/month
- **Google One 200GB**: $2.99/month
- **Google Workspace**: Starts at 30GB per user

### Estimated Storage Usage

- Average backup size: ~500MB compressed
- 7-day retention: ~3.5GB
- 30-day retention: ~15GB

**Recommendation**: Google One 100GB plan ($1.99/month) for 7-day retention

---

## Alternative: Service Account (Advanced)

For production environments, consider using a Service Account instead of OAuth:

### Benefits
- No refresh token expiration
- Better for automation
- Centralized access management

### Setup
1. Create Service Account in Google Cloud Console
2. Download JSON key file
3. Share Google Drive folder with service account email
4. Use service account credentials in edge function

---

## Summary

✅ Google Cloud project created  
✅ Google Drive API enabled  
✅ OAuth credentials configured  
✅ Refresh token obtained  
✅ Google Drive folder created  
✅ Environment variables set  
✅ Sync function deployed  
✅ Automated sync scheduled  

Your backups will now automatically sync to Google Drive!

---

**Next Steps:**
1. Monitor first automated sync (2:30 AM UTC)
2. Verify files appear in Google Drive
3. Test restoration from Google Drive backup
4. Set up storage quota alerts

**Support:**
- Google Cloud Console: https://console.cloud.google.com
- Google Drive API Docs: https://developers.google.com/drive/api/v3/about-sdk
- OAuth 2.0 Playground: https://developers.google.com/oauthplayground
