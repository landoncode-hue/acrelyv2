#!/bin/bash

# =====================================================
# Acrely Staging Verification Script
# =====================================================
# This script verifies the staging deployment
# =====================================================

set -e

echo "🔍 Verifying Staging Deployment..."

# Configuration
STAGING_URL="${STAGING_URL:-https://your-staging-url.vercel.app}"
STAGING_API_URL="${STAGING_SUPABASE_URL:-https://your-staging-project.supabase.co}"

echo "Testing: $STAGING_URL"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing application health..."
if curl -s -f "$STAGING_URL" > /dev/null; then
    echo "✅ Application is accessible"
else
    echo "❌ Application is not accessible"
    exit 1
fi

# Test 2: Database Connectivity
echo ""
echo "2️⃣  Testing database connectivity..."
if curl -s -f "$STAGING_API_URL/rest/v1/" > /dev/null; then
    echo "✅ Database is accessible"
else
    echo "❌ Database is not accessible"
    exit 1
fi

# Test 3: Check migrations applied
echo ""
echo "3️⃣  Verifying migrations..."
echo "Please verify manually in Supabase Studio:"
echo "  - profiles table has: auth_uid, staff_status, employee_id, avatar_url, dicebear_seed, metadata"
echo "  - staff_history table exists"
echo "  - RLS policies are active"
read -p "Are migrations applied correctly? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migrations verification failed"
    exit 1
fi
echo "✅ Migrations verified"

# Test 4: API Endpoints
echo ""
echo "4️⃣  Testing API endpoints..."
echo "Testing staff invite endpoint..."
# Add actual API test here if needed
echo "⚠️  Manual testing required - see test checklist below"

# Test 5: Email Configuration
echo ""
echo "5️⃣  Verifying email configuration..."
echo "Please check:"
echo "  - RESEND_API_KEY is set"
echo "  - RESEND_FROM_EMAIL is configured"
echo "  - DNS records (SPF, DKIM, DMARC) are set"
read -p "Is email configured correctly? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Email configuration verification failed"
    exit 1
fi
echo "✅ Email configuration verified"

# Manual Test Checklist
echo ""
echo "📋 Manual Testing Checklist"
echo "================================"
echo ""
echo "Please test the following features manually:"
echo ""
echo "Staff Management:"
echo "  [ ] Login as admin"
echo "  [ ] Navigate to /dashboard/staff"
echo "  [ ] Invite a new staff member"
echo "  [ ] Verify invitation email is sent"
echo "  [ ] Check staff appears with 'Invited' status"
echo "  [ ] Suspend a staff member"
echo "  [ ] Reactivate a staff member"
echo "  [ ] Change a staff member's role"
echo "  [ ] View staff detail page (all tabs)"
echo "  [ ] Test bulk import with CSV"
echo "  [ ] Test search and filters"
echo ""
echo "Monitoring:"
echo "  [ ] View monitoring dashboard (/dashboard/staff/monitoring)"
echo "  [ ] Check metrics are accurate"
echo "  [ ] View audit logs (/dashboard/audit)"
echo "  [ ] Filter audit logs by action type"
echo "  [ ] Export audit logs to CSV"
echo ""
echo "Security:"
echo "  [ ] Login as frontdesk - verify cannot access staff management"
echo "  [ ] Login as MD - verify cannot promote to sysadmin"
echo "  [ ] Verify RLS policies are enforced"
echo ""
echo "✅ Staging verification complete!"
echo ""
echo "If all tests pass, you can proceed to production deployment."
echo ""
