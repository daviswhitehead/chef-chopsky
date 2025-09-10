#!/bin/bash

# Chef Chopsky Agent Test Runner
# This script ensures the LangGraph dev server is running and runs the agent tests

set -e

echo "🧪 Chef Chopsky Agent Test Runner"
echo "=================================="

# Check if LangGraph dev server is running
if ! curl -f http://localhost:2024/health 2>/dev/null; then
    echo "⚠️  LangGraph dev server not running on port 2024"
    echo "🚀 Starting LangGraph dev server..."
    
    # Start the server in background
    npx @langchain/langgraph-cli dev &
    SERVER_PID=$!
    
    # Wait for server to be ready
    echo "⏳ Waiting for server to start..."
    timeout 30 bash -c 'until curl -f http://localhost:2024/health 2>/dev/null; do sleep 1; done'
    
    if [ $? -eq 0 ]; then
        echo "✅ LangGraph dev server started successfully"
    else
        echo "❌ Failed to start LangGraph dev server"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
else
    echo "✅ LangGraph dev server is already running"
fi

# Check environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set. Tests may fail."
fi

if [ -z "$LANGSMITH_API_KEY" ]; then
    echo "ℹ️  LANGSMITH_API_KEY not set. LangSmith tracing disabled."
    export LANGSMITH_TRACING="false"
else
    echo "✅ LangSmith tracing enabled"
    export LANGSMITH_TRACING="true"
fi

# Run the tests
echo ""
echo "🧪 Running agent tests..."
echo "========================="

if [ "$1" = "--watch" ]; then
    echo "👀 Running in watch mode..."
    yarn test:watch
elif [ "$1" = "--coverage" ]; then
    echo "📊 Running with coverage..."
    yarn test:coverage
else
    echo "🏃 Running tests..."
    yarn test:agent
fi

echo ""
echo "✅ Test run complete!"
