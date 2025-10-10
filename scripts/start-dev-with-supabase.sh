#!/bin/bash

# Script to start both frontend and agent with dynamic Supabase credentials
# This gives you a complete development environment with one command

echo "🚀 Starting Chef Chopsky development environment with dynamic Supabase..."

# Change to project root
cd "$(dirname "$0")/.." || exit 1

# Check if Supabase is running, start if not
echo "🔍 Checking Supabase status..."
cd frontend
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Supabase is not running. Starting it first..."
    supabase start
    if [ $? -ne 0 ]; then
        echo "❌ Failed to start Supabase. Please check Docker is running."
        exit 1
    fi
fi

# Extract credentials
echo "📋 Reading current Supabase credentials..."
SUPABASE_STATUS=$(supabase status)
SUPABASE_URL=$(echo "$SUPABASE_STATUS" | grep "API URL:" | awk '{print $3}')
SUPABASE_PUB_KEY=$(echo "$SUPABASE_STATUS" | grep "Publishable key:" | awk '{print $3}')
SUPABASE_SECRET_KEY=$(echo "$SUPABASE_STATUS" | grep "Secret key:" | awk '{print $3}')

# Validate credentials
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_PUB_KEY" ] || [ -z "$SUPABASE_SECRET_KEY" ]; then
    echo "❌ Failed to extract Supabase credentials."
    exit 1
fi

echo "✅ Supabase running at: $SUPABASE_URL"
echo "✅ Using dynamic credentials (no .env files needed!)"

# Go back to project root
cd ..

# Start both services with dynamic environment variables
echo "🎯 Starting frontend and agent services..."

# Check for port conflicts and kill existing processes
echo "🔍 Checking for existing processes on ports 3000 and 3001..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️ Port 3000 is in use. Killing existing process..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
fi
if lsof -i :3001 > /dev/null 2>&1; then
    echo "⚠️ Port 3001 is in use. Killing existing process..."
    lsof -ti :3001 | xargs kill -9 2>/dev/null || true
fi

# Start agent in background
echo "🤖 Starting agent service..."
cd agent
PORT=3001 npm run server:dev &
AGENT_PID=$!

# Go back to root and start frontend
cd ..
echo "🌐 Starting frontend service..."
cd frontend
PORT=3000 env \
    NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL" \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$SUPABASE_PUB_KEY" \
    SUPABASE_SECRET_KEY="$SUPABASE_SECRET_KEY" \
    npm run dev &
FRONTEND_PID=$!

# Wait for both processes
echo ""
echo "🎉 Development environment started!"
echo "📱 Frontend: http://localhost:3000"
echo "🤖 Agent: http://localhost:3001"
echo "🗄️ Supabase Studio: http://127.0.0.1:54323"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $FRONTEND_PID 2>/dev/null
    kill $AGENT_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait $FRONTEND_PID $AGENT_PID
