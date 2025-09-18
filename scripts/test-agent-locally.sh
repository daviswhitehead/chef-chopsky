#!/bin/bash

# 🧪 Local Agent Testing Script
# Simulates the CI workflow for agent testing

set -e

echo "🧪 Testing Agent Locally (CI Simulation)..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ $message${NC}"
    elif [ "$status" = "INFO" ]; then
        echo -e "${BLUE}ℹ️  $message${NC}"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    fi
}

# Check if we're in the right directory
if [ ! -f "agent/package.json" ]; then
    print_status "FAIL" "Please run this script from the project root directory"
    exit 1
fi

# Test 1: Build agent
echo ""
echo "🔨 Testing Agent Build..."
cd agent
if npm run build; then
    print_status "PASS" "Agent build successful"
else
    print_status "FAIL" "Agent build failed"
    exit 1
fi

# Test 2: Start server
echo ""
echo "🚀 Testing Server Startup..."
echo "Environment check:"
echo "  - OPENAI_API_KEY: ${OPENAI_API_KEY:+SET}"
echo "  - PORT: ${PORT:-3001}"
echo "  - NODE_ENV: ${NODE_ENV:-development}"

# Start server in background
npm run server > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 10

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    print_status "PASS" "Server process is running (PID: $SERVER_PID)"
    echo "Server log (first 10 lines):"
    head -10 server.log
else
    print_status "FAIL" "Server process failed to start"
    echo "Full server log:"
    cat server.log
    exit 1
fi

# Test 3: Health check
echo ""
echo "🏥 Testing Health Check..."
for i in {1..10}; do
    if ps -p $SERVER_PID > /dev/null; then
        if curl -s http://localhost:3001/health > /dev/null; then
            print_status "PASS" "Server health endpoint is responding"
            break
        else
            echo "Attempt $i: Health endpoint not responding yet..."
            sleep 2
        fi
    else
        print_status "FAIL" "Server process died"
        cat server.log
        exit 1
    fi
done

# Test 4: Test chat endpoint manually
echo ""
echo "💬 Testing Chat Endpoint Manually..."
CHAT_RESPONSE=$(curl -s -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "test-123",
    "messages": [{"role": "user", "content": "Hello"}]
  }' || echo "Request failed")

echo "Chat response: $CHAT_RESPONSE"

# Test 5: Run tests
echo ""
echo "🧪 Running Agent Tests..."
if yarn test:ci; then
    print_status "PASS" "Agent tests passed"
else
    print_status "FAIL" "Agent tests failed"
    # Clean up server
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Clean up
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
print_status "PASS" "Server stopped"

echo ""
print_status "PASS" "All agent tests completed successfully! 🎉"
