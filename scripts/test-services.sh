#!/bin/bash

# Test script to debug service startup issues
echo "🔍 Testing service startup..."

# Set environment variables
export OPENAI_API_KEY="sk-test-key-placeholder-replace-with-real-key"
export NODE_ENV="development"
export CI="true"

echo "📊 Environment variables:"
echo "  OPENAI_API_KEY: ${OPENAI_API_KEY:0:20}..."
echo "  NODE_ENV: $NODE_ENV"
echo "  CI: $CI"

# Test agent service startup
echo "🤖 Testing agent service startup..."
cd agent
echo "  - Agent directory: $(pwd)"
echo "  - Agent package.json exists: $([ -f package.json ] && echo 'yes' || echo 'no')"

# Try to start agent service
echo "  - Starting agent service..."
timeout 30s npm run server:dev &
AGENT_PID=$!
echo "  - Agent started with PID: $AGENT_PID"

# Wait a bit and check if it's running
sleep 5
if ps -p $AGENT_PID > /dev/null; then
    echo "✅ Agent service is running (PID: $AGENT_PID)"
    
    # Test health endpoint
    echo "  - Testing health endpoint..."
    for i in {1..10}; do
        if curl -s http://localhost:3001/health > /dev/null; then
            echo "✅ Agent health endpoint responding"
            break
        else
            echo "  - Attempt $i: Health endpoint not ready, waiting..."
            sleep 2
        fi
    done
else
    echo "❌ Agent service failed to start"
    echo "  - Checking for errors..."
    ps aux | grep tsx || echo "No tsx processes found"
fi

# Cleanup
echo "🛑 Cleaning up..."
pkill -f 'tsx watch' || true
cd ..

echo "✅ Service test completed"
