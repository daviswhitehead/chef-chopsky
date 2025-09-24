#!/bin/bash

# Chef Chopsky Development Helper Script
# This script ensures clean startup by killing any existing processes

echo "🧹 Cleaning up existing processes..."

# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null || true

# Kill any existing agent processes
pkill -f "tsx watch" 2>/dev/null || true

# Kill any existing npm dev processes
pkill -f "npm run dev" 2>/dev/null || true

echo "✅ Cleanup complete"

# Wait a moment for processes to fully terminate
sleep 2

echo "🚀 Starting Chef Chopsky services..."
echo "   Frontend: http://localhost:3000"
echo "   Agent:    http://localhost:3001"
echo ""

# Start the services
npm run dev
