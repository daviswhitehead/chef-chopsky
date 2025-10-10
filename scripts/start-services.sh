#!/bin/bash

# Start services for CI testing
echo "🚀 Starting Chef Chopsky services..."

# Clean up any existing services first
echo "🧹 Cleaning up any existing services..."
pkill -f 'next dev' || true
pkill -f 'tsx.*server' || true
pkill -f 'npm run dev' || true
pkill -f 'npm run server' || true
pkill -f 'tsx watch' || true
pkill -f 'tsx.*watch' || true
# Kill any processes using ports 3000 or 3001 (if lsof is available)
if command -v lsof >/dev/null 2>&1; then
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  lsof -ti:3001 | xargs kill -9 2>/dev/null || true
else
  echo "⚠️ lsof not available, using alternative cleanup"
  # Alternative cleanup using fuser if available
  if command -v fuser >/dev/null 2>&1; then
    fuser -k 3000/tcp 2>/dev/null || true
    fuser -k 3001/tcp 2>/dev/null || true
  fi
fi
sleep 3

# Check for port conflicts before starting services
echo "🔍 Checking for port conflicts..."
PORT_CONFLICT=false

# Check port 3000
if command -v lsof >/dev/null 2>&1; then
  if lsof -ti:3000 >/dev/null 2>&1; then
    echo "❌ Port 3000 is in use"
    PORT_CONFLICT=true
  fi
  if lsof -ti:3001 >/dev/null 2>&1; then
    echo "❌ Port 3001 is in use"
    PORT_CONFLICT=true
  fi
elif command -v fuser >/dev/null 2>&1; then
  if fuser 3000/tcp >/dev/null 2>&1; then
    echo "❌ Port 3000 is in use"
    PORT_CONFLICT=true
  fi
  if fuser 3001/tcp >/dev/null 2>&1; then
    echo "❌ Port 3001 is in use"
    PORT_CONFLICT=true
  fi
fi

if [ "$PORT_CONFLICT" = true ]; then
  echo "💥 Port conflicts detected! Services may fail to start."
  echo "🔧 Attempting additional cleanup..."
  pkill -f 'node.*3000' || true
  pkill -f 'node.*3001' || true
  sleep 2
else
  echo "✅ No port conflicts detected"
fi

# Additional aggressive cleanup for Act/Docker environments
echo "🔧 Performing aggressive cleanup for Act/Docker environments..."
# Kill any processes that might be using our ports
pkill -f 'next' || true
pkill -f 'tsx' || true
pkill -f 'npm.*dev' || true
pkill -f 'npm.*server' || true
# Kill any node processes that might be lingering
pkill -f 'node.*start-server' || true
pkill -f 'node.*next' || true
pkill -f 'node.*tsx' || true
sleep 3

# Use standard ports for all environments
export FRONTEND_PORT=3000
export AGENT_PORT=3001
export FRONTEND_URL="http://localhost:3000"
export AGENT_SERVICE_URL="http://localhost:3001"

echo "📊 Service startup environment:"
echo "  - Working directory: $(pwd)"
echo "  - Node version: $(node --version)"
echo "  - NPM version: $(npm --version)"
# Check port availability (if netstat is available)
if command -v netstat >/dev/null 2>&1; then
  echo "  - Available ports: $(netstat -tuln | grep -E ':(3000|3001)' || echo 'Ports 3000, 3001 available')"
else
  echo "  - Port check: netstat not available, assuming ports 3000, 3001 available"
fi

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
echo "  - Using port: $FRONTEND_PORT"
PORT=$FRONTEND_PORT npm run dev > "$LOG_FILE" 2>&1 &
FRONTEND_PID=$!
echo "  - Frontend started with PID: $FRONTEND_PID"
cd ..

# Start agent service
echo "🤖 Starting agent service..."
cd agent
echo "  - Agent directory: $(pwd)"
echo "  - Agent package.json exists: $([ -f package.json ] && echo 'yes' || echo 'no')"
echo "  - Using port: $AGENT_PORT"
npm run server >> "$LOG_FILE" 2>&1 &
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
echo "  - Frontend: $FRONTEND_URL (PID: $FRONTEND_PID)"
echo "  - Agent: $AGENT_SERVICE_URL (PID: $AGENT_PID)"
echo "  - Logs: $LOG_FILE"

# Keep the script running
wait
