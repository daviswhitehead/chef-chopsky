#!/bin/bash
set -e

echo "🚀 Running Agent Integration Tests with Act..."
echo "=============================================="
echo ""

# Validate environment file exists
if [ ! -f .github/testing/.env.ci ]; then
  echo "❌ Error: .github/testing/.env.ci not found"
  echo "Please create this file based on .github/testing/.env.ci.example"
  exit 1
fi

# Check for required secrets in environment file
if ! grep -q "OPENAI_API_KEY=sk-" .github/testing/.env.ci; then
  echo "⚠️  Warning: OPENAI_API_KEY may not be set in .env.ci"
  echo "Make sure it starts with 'sk-' for real API calls"
fi

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f 'next dev' || true
pkill -f 'tsx.*server' || true
pkill -f 'npm run dev' || true
pkill -f 'npm run server' || true
sleep 3

# Run integration-tests-agent job with Act
echo "🎯 Running integration-tests-agent job with Act..."
echo "This will use the configuration from .github/testing/.env.ci"
echo ""

act -W .github/workflows/ci.yml -j integration-tests-agent \
  --env-file .github/testing/.env.ci \
  --container-architecture linux/amd64 \
  -v 2>&1 | tee /tmp/act-integration-test-output.log

echo ""
echo "✅ Act run completed!"
echo "📋 Full output saved to: /tmp/act-integration-test-output.log"
