#!/bin/bash

# Start services for CI testing
echo "🚀 Starting Chef Chopsky services..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Cleaning up services..."
    pkill -f 'next dev' || true
    pkill -f 'tsx watch' || true
    pkill -f 'npm run dev' || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM EXIT

# Start frontend service
echo "📱 Starting frontend service..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Start agent service
echo "🤖 Starting agent service..."
cd agent
npm run server:dev &
AGENT_PID=$!
cd ..

echo "✅ Services started:"
echo "  Frontend PID: $FRONTEND_PID"
echo "  Agent PID: $AGENT_PID"

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend service is running"
else
    echo "❌ Frontend service failed to start"
    exit 1
fi

if ps -p $AGENT_PID > /dev/null; then
    echo "✅ Agent service is running"
else
    echo "❌ Agent service failed to start"
    exit 1
fi

echo "🎉 All services are running successfully!"

# Keep the script running
wait
