#!/bin/bash

# Run E2E tests directly, bypassing dependencies
echo "🚀 Running E2E tests directly (bypassing dependencies)..."
echo "📋 This will run only the E2E job without dependencies"
echo ""

# Clean up any existing processes first
echo "🧹 Cleaning up any existing processes..."
pkill -f 'next dev' || true
pkill -f 'tsx.*server' || true
pkill -f 'npm run dev' || true
pkill -f 'npm run server' || true
sleep 3

# Run E2E job using E2E-only workflow (no dependencies)
echo "🎯 Running E2E job using E2E-only workflow..."
act -W .github/workflows/ci-e2e-only.yml -j e2e --matrix shard:1/1 -v --env-file .github/testing/.env.ci --container-architecture linux/amd64

echo ""
echo "✅ E2E tests completed!"
