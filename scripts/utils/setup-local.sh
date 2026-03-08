#!/bin/bash

# =====================================================
# Acrely Local Development Setup Script
# =====================================================
# This script sets up the local Supabase environment
# for testing the staff management module
# =====================================================

set -e

echo "🚀 Setting up Acrely local development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "Install with: brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI is installed"

# Stop any existing Supabase instance
echo "🛑 Stopping any existing Supabase instance..."
supabase stop || true

# Start Supabase local development
echo "🔧 Starting Supabase local development..."
supabase start

# Wait for Supabase to be ready
echo "⏳ Waiting for Supabase to be ready..."
sleep 5

# Get the local Supabase credentials
echo ""
echo "📋 Local Supabase Credentials:"
echo "================================"
supabase status

# Apply migrations
echo ""
echo "🔄 Applying database migrations..."
supabase db reset

echo ""
echo "✅ Local development environment is ready!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the API URL and anon key from above"
echo "2. Update your .env.local file:"
echo "   NEXT_PUBLIC_SUPABASE_URL=<API URL>"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>"
echo "   SUPABASE_SERVICE_ROLE_KEY=<service_role key>"
echo "3. Run 'npm run dev' to start the Next.js app"
echo ""
echo "🔗 Supabase Studio: http://localhost:54323"
echo "🔗 API URL: http://localhost:54321"
echo ""
