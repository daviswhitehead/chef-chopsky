#!/bin/bash
# Run E2E tests directly with Act (skip dependencies)
# This allows immediate E2E testing without waiting for code-quality and integration tests

set -e

echo "🚀 Running E2E tests locally with Act..."
echo "📋 This will run the E2E job directly, skipping code-quality and integration tests"
echo ""

# Run E2E tests with Act
# -W: Specify workflow file to avoid other workflow issues
# -j e2e: Run only the e2e job
# --matrix shard:1/1: Run single shard for faster execution
# -v: Verbose logging for cursor agent access
# --env-file: Use combined CI environment file
# --container-architecture: Fix Apple M-series compatibility
act -W .github/workflows/ci.yml -j e2e --matrix shard:1/1 -v --env-file env.ci --container-architecture linux/amd64

echo ""
echo "✅ E2E tests completed!"
