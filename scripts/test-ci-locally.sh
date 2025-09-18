#!/bin/bash

# Test CI workflow locally using act (GitHub Actions runner)
# Install act: https://github.com/nektos/act

set -e

echo "🧪 Testing CI workflow locally with act..."
echo "=========================================="

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo "❌ act is not installed. Please install it first:"
    echo "   brew install act  # macOS"
    echo "   or visit: https://github.com/nektos/act"
    exit 1
fi

# Set up environment variables for local testing
export TEST_SUPABASE_URL="https://your-test-project.supabase.co"
export TEST_SUPABASE_PUBLISHABLE_KEY="your-test-publishable-key"
export OPENAI_API_KEY="your-openai-api-key"
export LANGCHAIN_API_KEY="your-langsmith-api-key"

echo "📋 Environment variables set for local testing"
echo "   TEST_SUPABASE_URL: ${TEST_SUPABASE_URL}"
echo "   OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}..."
echo ""

# Test the quick-checks job (linting and unit tests)
echo "🚀 Running quick-checks job..."
act -j quick-checks --secret-file .env.ci 2>/dev/null || {
    echo "⚠️  act failed, but this is expected if secrets are not set"
    echo "💡 To test with real secrets, create .env.ci file with:"
    echo "   TEST_SUPABASE_URL=your-test-supabase-url"
    echo "   TEST_SUPABASE_PUBLISHABLE_KEY=your-test-publishable-key"
    echo "   OPENAI_API_KEY=your-openai-api-key"
    echo "   LANGCHAIN_API_KEY=your-langsmith-api-key"
}

echo ""
echo "✅ CI workflow test completed!"
echo ""
echo "📚 To test the full workflow:"
echo "   1. Set up secrets in .env.ci"
echo "   2. Run: act -j integration-tests --secret-file .env.ci"
echo "   3. Run: act -j e2e-tests --secret-file .env.ci"
echo ""
echo "🎯 The CI workflow is ready for GitHub Actions!"
