#!/bin/bash

# =====================================================
# Acrely Production Verification Script
# =====================================================
# This script verifies the production deployment
# =====================================================

set -e

echo "🔍 Verifying Production Deployment..."
echo ""

# Configuration
PRODUCTION_URL="${PRODUCTION_URL:-https://your-production-url.vercel.app}"

echo "Testing: $PRODUCTION_URL"
echo ""

# Test 1: Smoke Test
echo "1️⃣  Running smoke tests..."
echo "Testing application accessibility..."
if curl -s -f "$PRODUCTION_URL" > /dev/null; then
    echo "✅ Application is accessible"
else
    echo "❌ Application is not accessible"
    exit 1
fi

# Test 2: Critical Flow Test
echo ""
echo "2️⃣  Testing critical flows..."
echo ""
echo "Please test the following CRITICAL flows:"
echo ""
echo "  1. Admin Login"
echo "     - Navigate to $PRODUCTION_URL/login"
echo "     - Login with admin credentials"
echo "     - Verify dashboard loads"
echo ""
echo "  2. Staff Invitation"
echo "     - Navigate to /dashboard/staff"
echo "     - Click 'Invite Staff'"
echo "     - Send ONE test invitation"
echo "     - Verify email is received"
echo ""
echo "  3. View Staff List"
echo "     - Verify all staff members display"
echo "     - Test search functionality"
echo "     - Test filters"
echo ""
read -p "Have all critical flows been tested successfully? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Critical flow verification failed"
    exit 1
fi
echo "✅ Critical flows verified"

# Test 3: Database Check
echo ""
echo "3️⃣  Verifying database..."
echo "Please check in Supabase Studio:"
echo "  - All migrations applied"
echo "  - RLS policies active"
echo "  - No errors in logs"
read -p "Is database healthy? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Database verification failed"
    exit 1
fi
echo "✅ Database verified"

# Test 4: Monitoring Check
echo ""
echo "4️⃣  Checking monitoring..."
echo "Please verify:"
echo "  - Error tracking is active"
echo "  - Audit logs are being captured"
echo "  - Email delivery is working"
read -p "Is monitoring working? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Monitoring verification failed"
    exit 1
fi
echo "✅ Monitoring verified"

# Post-Deployment Checklist
echo ""
echo "📋 Post-Deployment Checklist"
echo "================================"
echo ""
echo "Immediate (Next 30 minutes):"
echo "  [ ] Monitor error logs"
echo "  [ ] Check audit logs for unusual activity"
echo "  [ ] Verify email delivery (check Resend dashboard)"
echo "  [ ] Test one staff invitation end-to-end"
echo "  [ ] Verify RLS policies are enforced"
echo ""
echo "Within 24 hours:"
echo "  [ ] Review all audit logs"
echo "  [ ] Check staff status metrics"
echo "  [ ] Verify no performance degradation"
echo "  [ ] Collect user feedback"
echo ""
echo "Within 1 week:"
echo "  [ ] Review email delivery rates"
echo "  [ ] Check for any edge cases"
echo "  [ ] Document any issues found"
echo "  [ ] Plan for any necessary hotfixes"
echo ""
echo "✅ Production verification complete!"
echo ""
echo "🎉 Staff Management Module is now LIVE in production!"
echo ""
