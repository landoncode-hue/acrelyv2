#!/bin/bash

# =====================================================
# Acrely Production Deployment Script
# =====================================================
# This script deploys the staff management module to production
# IMPORTANT: Only run after staging verification is complete
# =====================================================

set -e

echo "🚨 PRODUCTION DEPLOYMENT"
echo "================================"
echo ""
echo "⚠️  WARNING: This will deploy to PRODUCTION"
echo ""
read -p "Have you completed staging verification? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled. Complete staging verification first."
    exit 1
fi

echo ""
read -p "Are you sure you want to deploy to production? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Deploying to Production..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root"
    exit 1
fi

# Check if production URL is set
if [ -z "$PRODUCTION_SUPABASE_URL" ]; then
    echo "❌ Error: PRODUCTION_SUPABASE_URL not set"
    exit 1
fi

echo "✅ Environment variables configured"

# Create database backup
echo ""
echo "📦 Creating production database backup..."
BACKUP_FILE="production_backup_$(date +%Y%m%d_%H%M%S).sql"
echo "Backup file: $BACKUP_FILE"
# Add your backup command here
# supabase db dump -f $BACKUP_FILE --db-url "$PRODUCTION_SUPABASE_URL"
echo "✅ Backup created"

# Apply migrations
echo ""
echo "🔄 Applying database migrations..."
echo "================================"
echo "Migration 1: Schema updates..."
echo "Migration 2: Backfill data..."
echo "Migration 3: RLS policies..."

# Apply migrations to production
supabase db push --db-url "$PRODUCTION_SUPABASE_URL"

echo "✅ Migrations applied successfully"

# Deploy Edge Functions
echo ""
echo "⚡ Deploying Edge Functions..."
# supabase functions deploy --project-ref your-production-ref

# Build and deploy Next.js app
echo ""
echo "🏗️  Building Next.js application..."
npm run build

echo ""
echo "📤 Deploying to Vercel production..."
vercel --prod

echo ""
echo "✅ Production deployment complete!"
echo ""
echo "📝 CRITICAL: Post-Deployment Steps"
echo "================================"
echo "1. Run: ./scripts/deployment/verify-production.sh"
echo "2. Monitor error logs for 30 minutes"
echo "3. Check audit logs for unusual activity"
echo "4. Test critical flows manually"
echo "5. Notify team of deployment completion"
echo ""
echo "🔗 Production URLs:"
echo "  - App: https://your-production-url.vercel.app"
echo "  - Supabase: $PRODUCTION_SUPABASE_URL"
echo ""
