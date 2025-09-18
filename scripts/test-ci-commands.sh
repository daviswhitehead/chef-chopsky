#!/bin/bash

# 🧪 Local CI Command Testing Script
# Tests the actual commands that will run in GitHub Actions

set -e

echo "🧪 Testing CI Commands Locally..."
echo "=================================="

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

# Test 1: Linting
echo ""
echo "🔍 Testing Linting..."
if npm run lint; then
    print_status "PASS" "Linting passed"
else
    print_status "FAIL" "Linting failed"
    exit 1
fi

# Test 2: Frontend Unit Tests
echo ""
echo "🧪 Testing Frontend Unit Tests..."
if npm run test:frontend; then
    print_status "PASS" "Frontend unit tests passed"
else
    print_status "FAIL" "Frontend unit tests failed"
    exit 1
fi

# Test 3: Integration Tests
echo ""
echo "🔗 Testing Integration Tests..."
if npm run test:integration; then
    print_status "PASS" "Integration tests passed"
else
    print_status "FAIL" "Integration tests failed"
    exit 1
fi

# Test 4: Build Tests
echo ""
echo "🏗️  Testing Build..."
if npm run build; then
    print_status "PASS" "Build passed"
else
    print_status "FAIL" "Build failed"
    exit 1
fi

# Test 5: Health Check Script
echo ""
echo "🏥 Testing Health Check Script..."
if node scripts/health-check.js; then
    print_status "PASS" "Health check script works"
else
    print_status "WARN" "Health check script failed (expected if services not running)"
fi

echo ""
echo "🎉 All CI Commands Tested Successfully!"
echo "======================================"
echo ""
echo "📋 Summary:"
echo "   ✅ Linting: Passed"
echo "   ✅ Frontend Unit Tests: Passed"
echo "   ✅ Integration Tests: Passed"
echo "   ✅ Build: Passed"
echo "   ⚠️  Health Check: Tested (may fail if services not running)"
echo ""
echo "🚀 Ready for GitHub Actions!"
echo ""
echo "💡 To test E2E tests, run:"
echo "   npm run start:services"
echo "   npm run health:check"
echo "   npm run test:e2e"
echo "   npm run stop:services"
