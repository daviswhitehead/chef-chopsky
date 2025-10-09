#!/bin/bash

# Start services for CI testing
echo "🚀 Starting Chef Chopsky services..."
echo "📊 Service startup environment:"
echo "  - Working directory: $(pwd)"
echo "  - Node version: $(node --version)"
echo "  - NPM version: $(npm --version)"
echo "  - Available ports: $(netstat -tuln | grep -E ':(3000|3001)' || echo 'Ports 3000, 3001 available')"

# Create log file for service output
LOG_FILE="/tmp/chef-chopsky-services.log"
echo "📝 Service logs will be written to: $LOG_FILE"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Cleaning up services..."
    echo "📊 Final service status:"
    ps aux | grep -E "(next|tsx|npm)" | grep -v grep || echo "No services running"
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
echo "  - Frontend directory: $(pwd)"
echo "  - Frontend package.json exists: $([ -f package.json ] && echo 'yes' || echo 'no')"
npm run dev > "$LOG_FILE" 2>&1 &
FRONTEND_PID=$!
echo "  - Frontend started with PID: $FRONTEND_PID"
cd ..

# Start agent service
echo "🤖 Starting agent service..."
cd agent
echo "  - Agent directory: $(pwd)"
echo "  - Agent package.json exists: $([ -f package.json ] && echo 'yes' || echo 'no')"
npm run server:dev >> "$LOG_FILE" 2>&1 &
AGENT_PID=$!
echo "  - Agent started with PID: $AGENT_PID"
cd ..

echo "✅ Services started:"
echo "  Frontend PID: $FRONTEND_PID"
echo "  Agent PID: $AGENT_PID"
echo "  Log file: $LOG_FILE"

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Verifying service startup..."
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend service is running (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend service failed to start (PID: $FRONTEND_PID)"
    echo "📋 Frontend startup logs:"
    tail -20 "$LOG_FILE" | grep -E "(frontend|next|error)" || echo "No frontend logs found"
    exit 1
fi

if ps -p $AGENT_PID > /dev/null; then
    echo "✅ Agent service is running (PID: $AGENT_PID)"
else
    echo "❌ Agent service failed to start (PID: $AGENT_PID)"
    echo "📋 Agent startup logs:"
    tail -20 "$LOG_FILE" | grep -E "(agent|tsx|server|error)" || echo "No agent logs found"
    exit 1
fi

echo "🎉 All services are running successfully!"
echo "📊 Service status summary:"
echo "  - Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo "  - Agent: http://localhost:3001 (PID: $AGENT_PID)"
echo "  - Logs: $LOG_FILE"

# Keep the script running
wait
