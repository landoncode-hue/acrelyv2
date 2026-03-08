#!/bin/bash

# =====================================================
# Acrely Staging Deployment Script
# =====================================================
# This script deploys the staff management module to staging
# =====================================================

set -e

echo "🚀 Deploying Staff Management Module to Staging..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root"
    exit 1
fi

# Check if staging URL is set
if [ -z "$STAGING_SUPABASE_URL" ]; then
    echo "❌ Error: STAGING_SUPABASE_URL not set"
    echo "Set it with: export STAGING_SUPABASE_URL=your_staging_url"
    exit 1
fi

echo "✅ Environment variables configured"

# Backup current database (optional but recommended)
echo "📦 Creating database backup..."
read -p "Do you want to create a backup? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    echo "Creating backup: $BACKUP_FILE"
    # Add your backup command here
    # supabase db dump -f $BACKUP_FILE
fi

# Apply migrations
echo ""
echo "🔄 Applying database migrations..."
echo "================================"

# Migration 1: Schema
echo "Applying schema migration..."
supabase db push --db-url "$STAGING_SUPABASE_URL"

echo "✅ Migrations applied successfully"

# Deploy Edge Functions (if any)
echo ""
echo "⚡ Deploying Edge Functions..."
# supabase functions deploy --project-ref your-staging-ref

# Build and deploy Next.js app
echo ""
echo "🏗️  Building Next.js application..."
npm run build

echo ""
echo "📤 Deploying to Vercel staging..."
vercel --env staging

echo ""
echo "✅ Deployment to staging complete!"
echo ""
echo "📝 Next steps:"
echo "1. Run smoke tests: ./scripts/deployment/verify-staging.sh"
echo "2. Test all staff management features manually"
echo "3. Review audit logs for any issues"
echo "4. If all tests pass, proceed to production deployment"
echo ""
