#!/bin/bash

# Script to start frontend with dynamic Supabase credentials
# This reads the current Supabase credentials and passes them as environment variables
# No need to modify .env files!

echo "🚀 Starting frontend with dynamic Supabase credentials..."

# Change to frontend directory where Supabase is configured
cd "$(dirname "$0")/../frontend" || exit 1

# Check if Supabase is running
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Supabase is not running. Starting it first..."
    supabase start
    if [ $? -ne 0 ]; then
        echo "❌ Failed to start Supabase. Please check Docker is running."
        exit 1
    fi
fi

# Extract credentials from supabase status
echo "📋 Reading current Supabase credentials..."

SUPABASE_STATUS=$(supabase status)

# Extract credentials
SUPABASE_URL=$(echo "$SUPABASE_STATUS" | grep "API URL:" | awk '{print $3}')
SUPABASE_PUB_KEY=$(echo "$SUPABASE_STATUS" | grep "Publishable key:" | awk '{print $3}')
SUPABASE_SECRET_KEY=$(echo "$SUPABASE_STATUS" | grep "Secret key:" | awk '{print $3}')

# Validate credentials were extracted
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_PUB_KEY" ] || [ -z "$SUPABASE_SECRET_KEY" ]; then
    echo "❌ Failed to extract Supabase credentials. Check 'supabase status' output."
    exit 1
fi

echo "✅ Using Supabase URL: $SUPABASE_URL"
echo "✅ Using Publishable Key: ${SUPABASE_PUB_KEY:0:20}..."
echo "✅ Using Secret Key: ${SUPABASE_SECRET_KEY:0:20}..."

# Start frontend with dynamic environment variables
echo "🎯 Starting Next.js frontend..."
exec env \
    NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL" \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$SUPABASE_PUB_KEY" \
    SUPABASE_SECRET_KEY="$SUPABASE_SECRET_KEY" \
    npm run dev
