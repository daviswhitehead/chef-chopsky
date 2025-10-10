#!/bin/bash

# Script to extract and display current local Supabase credentials
# This helps developers get the current credentials after starting Supabase

echo "🔍 Current Local Supabase Credentials:"
echo "======================================"

# Change to frontend directory where Supabase is configured
cd "$(dirname "$0")/../frontend" || exit 1

# Check if Supabase is running
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Supabase is not running. Start it first with: npm run supabase:start"
    exit 1
fi

# Extract credentials from supabase status
echo ""
echo "📋 Copy these values to your .env.local file:"
echo ""

# Get the status output and extract key values
SUPABASE_STATUS=$(supabase status)

# Extract URL
URL=$(echo "$SUPABASE_STATUS" | grep "API URL:" | awk '{print $3}')
echo "NEXT_PUBLIC_SUPABASE_URL=$URL"

# Extract publishable key
PUB_KEY=$(echo "$SUPABASE_STATUS" | grep "Publishable key:" | awk '{print $3}')
echo "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$PUB_KEY"

# Extract secret key
SECRET_KEY=$(echo "$SUPABASE_STATUS" | grep "Secret key:" | awk '{print $3}')
echo "SUPABASE_SECRET_KEY=$SECRET_KEY"

echo ""
echo "💡 Quick setup:"
echo "1. Copy the values above"
echo "2. Paste them into frontend/.env.local"
echo "3. Or run: npm run supabase:env:copy"
