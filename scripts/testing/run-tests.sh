#!/bin/bash

# =====================================================
# Acrely Test Runner Script
# =====================================================
# This script runs the staff management test suite
# =====================================================

set -e

echo "🧪 Running Staff Management Test Suite..."

# Check if local Supabase is running
if ! curl -s http://localhost:54321/health > /dev/null 2>&1; then
    echo "❌ Local Supabase is not running"
    echo "Run './scripts/setup-local.sh' first"
    exit 1
fi

echo "✅ Local Supabase is running"

# Check if test environment is configured
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found"
    echo "Create .env.local with your local Supabase credentials"
    exit 1
fi

echo "✅ Environment configured"

# Check if Playwright is installed
if ! npx playwright --version > /dev/null 2>&1; then
    echo "📦 Installing Playwright..."
    npx playwright install
fi

echo "✅ Playwright is ready"

# Run RLS policy tests first
echo ""
echo "🔒 Running RLS Policy Tests..."
echo "================================"
psql postgresql://postgres:postgres@localhost:54322/postgres -f tests/rls-policy-tests.sql

# Run Playwright tests
echo ""
echo "🎭 Running Playwright Tests..."
echo "================================"

# Set test environment
export NODE_ENV=test
export NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321

# Run tests
npx playwright test tests/staff-management.spec.ts --reporter=list

echo ""
echo "✅ All tests completed!"
echo ""
echo "📊 Test Summary:"
echo "  - RLS Policy Tests: Check output above"
echo "  - Playwright Tests: Check output above"
echo ""
echo "📝 Next steps:"
echo "  1. Review any test failures"
echo "  2. Fix issues and re-run tests"
echo "  3. Once all tests pass, proceed to staging deployment"
echo ""
