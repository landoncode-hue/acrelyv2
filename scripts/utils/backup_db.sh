#!/bin/bash

# =====================================================
# Acrely Database Backup Script (Enhanced)
# =====================================================
# Usage: ./backup_db.sh [environment]
# Arguments:
#   environment: local|production (default: local)
# Prerequisites: 
#   - pg_dump installed
#   - DATABASE_URL set in environment
# =====================================================

set -e  # Exit on error
set -o pipefail  # Catch errors in pipes

# =====================================================
# CONFIGURATION
# =====================================================

ENVIRONMENT="${1:-local}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
FILENAME="acrely_backup_${ENVIRONMENT}_${TIMESTAMP}.sql"
COMPRESSED_FILENAME="${FILENAME}.gz"
RETENTION_DAYS=7
LOG_FILE="${BACKUP_DIR}/backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =====================================================
# LOGGING FUNCTIONS
# =====================================================

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# =====================================================
# ENVIRONMENT SETUP
# =====================================================

# Load environment variables
if [ "$ENVIRONMENT" = "local" ]; then
    if [ -f .env.local ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
        log "Loaded .env.local"
    fi
elif [ "$ENVIRONMENT" = "production" ]; then
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
        log "Loaded .env"
    fi
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "========================================="
log "Starting Acrely Database Backup"
log "Environment: $ENVIRONMENT"
log "========================================="

# =====================================================
# VALIDATION
# =====================================================

if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL not found in environment"
    exit 1
fi

# Check if pg_dump is installed
if ! command -v pg_dump &> /dev/null; then
    error "pg_dump not found. Please install PostgreSQL client tools"
    exit 1
fi

log "✓ Environment validated"

# =====================================================
# BACKUP EXECUTION
# =====================================================

log "Creating backup: $FILENAME"

# Perform backup
if pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$FILENAME" 2>> "$LOG_FILE"; then
    log "✓ Database dump completed"
else
    error "Database dump failed"
    exit 1
fi

# =====================================================
# COMPRESSION
# =====================================================

log "Compressing backup..."

if gzip -f "$BACKUP_DIR/$FILENAME"; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_FILENAME" | cut -f1)
    log "✓ Backup compressed: $BACKUP_SIZE"
else
    error "Compression failed"
    exit 1
fi

# =====================================================
# CHECKSUM GENERATION
# =====================================================

log "Generating checksum..."

CHECKSUM=$(shasum -a 256 "$BACKUP_DIR/$COMPRESSED_FILENAME" | cut -d' ' -f1)
echo "$CHECKSUM  $COMPRESSED_FILENAME" > "$BACKUP_DIR/${COMPRESSED_FILENAME}.sha256"
log "✓ Checksum: $CHECKSUM"

# =====================================================
# CLEANUP OLD BACKUPS
# =====================================================

log "Cleaning up old backups (retention: $RETENTION_DAYS days)..."

# Find and delete backups older than retention period
DELETED_COUNT=$(find "$BACKUP_DIR" -name "acrely_backup_${ENVIRONMENT}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
    log "✓ Deleted $DELETED_COUNT old backup(s)"
else
    log "✓ No old backups to delete"
fi

# =====================================================
# CLOUD SYNC (Optional)
# =====================================================

# Uncomment and configure for cloud storage sync
# if [ -n "$ENABLE_CLOUD_SYNC" ] && [ "$ENABLE_CLOUD_SYNC" = "true" ]; then
#     log "Syncing to cloud storage..."
#     
#     # Google Drive (requires gdrive CLI)
#     if command -v gdrive &> /dev/null && [ -n "$GDRIVE_FOLDER_ID" ]; then
#         gdrive upload --parent "$GDRIVE_FOLDER_ID" "$BACKUP_DIR/$COMPRESSED_FILENAME"
#         log "✓ Uploaded to Google Drive"
#     fi
#     
#     # AWS S3 (requires aws CLI)
#     if command -v aws &> /dev/null && [ -n "$AWS_S3_BUCKET" ]; then
#         aws s3 cp "$BACKUP_DIR/$COMPRESSED_FILENAME" "s3://$AWS_S3_BUCKET/backups/"
#         log "✓ Uploaded to AWS S3"
#     fi
# fi

# =====================================================
# SUMMARY
# =====================================================

log "========================================="
log "Backup completed successfully!"
log "========================================="
log "File: $BACKUP_DIR/$COMPRESSED_FILENAME"
log "Size: $BACKUP_SIZE"
log "Checksum: $CHECKSUM"
log "========================================="

# Output JSON for programmatic use
cat > "$BACKUP_DIR/${COMPRESSED_FILENAME}.json" <<EOF
{
  "filename": "$COMPRESSED_FILENAME",
  "environment": "$ENVIRONMENT",
  "timestamp": "$TIMESTAMP",
  "size_bytes": $(stat -f%z "$BACKUP_DIR/$COMPRESSED_FILENAME" 2>/dev/null || stat -c%s "$BACKUP_DIR/$COMPRESSED_FILENAME"),
  "checksum": "$CHECKSUM",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

exit 0
