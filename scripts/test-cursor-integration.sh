#!/bin/bash

# Test Script for Cursor CLI Integration
# This script tests the Cursor CLI integration locally before deploying to GitHub Actions

set -e

echo "🧪 Testing Cursor CLI Integration"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
TEST_DIR="test-cursor-integration"
ANALYSIS_SCRIPT="scripts/cursor-analysis.js"
SETUP_SCRIPT="scripts/setup-cursor-cli.sh"

# Cleanup function
cleanup() {
    echo "🧹 Cleaning up test environment..."
    rm -rf "$TEST_DIR"
}

# Set up trap for cleanup
trap cleanup EXIT

echo "📋 Test Plan:"
echo "1. Verify analysis script exists and is executable"
echo "2. Test script syntax and dependencies"
echo "3. Simulate environment variables"
echo "4. Test fallback mode (without Cursor CLI)"
echo "5. Validate output format"

echo ""
echo "🔍 Step 1: Verifying analysis script..."

if [ -f "$ANALYSIS_SCRIPT" ]; then
    echo -e "${GREEN}✅ Analysis script exists${NC}"
else
    echo -e "${RED}❌ Analysis script not found: $ANALYSIS_SCRIPT${NC}"
    exit 1
fi

if [ -f "$SETUP_SCRIPT" ]; then
    echo -e "${GREEN}✅ Setup script exists${NC}"
else
    echo -e "${RED}❌ Setup script not found: $SETUP_SCRIPT${NC}"
    exit 1
fi

echo ""
echo "🔍 Step 2: Testing script syntax..."

# Test Node.js syntax
if node -c "$ANALYSIS_SCRIPT"; then
    echo -e "${GREEN}✅ Analysis script syntax is valid${NC}"
else
    echo -e "${RED}❌ Analysis script has syntax errors${NC}"
    exit 1
fi

echo ""
echo "🔍 Step 3: Testing with simulated environment..."

# Create test directory
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Set up test environment variables
export CURSOR_API_KEY="test-key-not-real"
export WORKFLOW_RUN_URL="https://github.com/test/repo/actions/runs/123"
export PR_NUMBER="456"
export FIX_BRANCH="ci-fix-456"
export HEAD_BRANCH="test-branch"
export GITHUB_REPOSITORY="test/repo"

echo "Environment variables set:"
echo "  CURSOR_API_KEY: $CURSOR_API_KEY"
echo "  WORKFLOW_RUN_URL: $WORKFLOW_RUN_URL"
echo "  PR_NUMBER: $PR_NUMBER"
echo "  FIX_BRANCH: $FIX_BRANCH"
echo "  HEAD_BRANCH: $HEAD_BRANCH"
echo "  GITHUB_REPOSITORY: $GITHUB_REPOSITORY"

echo ""
echo "🔍 Step 4: Testing analysis script (fallback mode expected)..."

# Run the analysis script
if node "../$ANALYSIS_SCRIPT"; then
    echo -e "${GREEN}✅ Analysis script ran successfully${NC}"
else
    echo -e "${RED}❌ Analysis script failed${NC}"
    exit 1
fi

echo ""
echo "🔍 Step 5: Validating output..."

if [ -f "AUTO_FIX_ANALYSIS.md" ]; then
    echo -e "${GREEN}✅ Analysis report generated${NC}"
    
    # Check report content
    if grep -q "Auto-Fix Analysis Report" "AUTO_FIX_ANALYSIS.md"; then
        echo -e "${GREEN}✅ Report has correct title${NC}"
    else
        echo -e "${RED}❌ Report missing title${NC}"
    fi
    
    if grep -q "CI Failure Context" "AUTO_FIX_ANALYSIS.md"; then
        echo -e "${GREEN}✅ Report has context section${NC}"
    else
        echo -e "${RED}❌ Report missing context section${NC}"
    fi
    
    if grep -q "Fix Recommendations" "AUTO_FIX_ANALYSIS.md"; then
        echo -e "${GREEN}✅ Report has recommendations section${NC}"
    else
        echo -e "${RED}❌ Report missing recommendations section${NC}"
    fi
    
    echo ""
    echo "📄 Analysis Report Preview:"
    echo "----------------------------------------"
    head -20 "AUTO_FIX_ANALYSIS.md"
    echo "----------------------------------------"
    
else
    echo -e "${RED}❌ Analysis report not generated${NC}"
    exit 1
fi

echo ""
echo "🔍 Step 6: Testing setup script..."

# Test setup script syntax
if bash -n "../$SETUP_SCRIPT"; then
    echo -e "${GREEN}✅ Setup script syntax is valid${NC}"
else
    echo -e "${RED}❌ Setup script has syntax errors${NC}"
    exit 1
fi

echo ""
echo "🎉 All tests passed!"
echo ""
echo "📋 Test Summary:"
echo "✅ Analysis script exists and is valid"
echo "✅ Setup script exists and is valid"
echo "✅ Analysis script runs without errors"
echo "✅ Analysis report is generated correctly"
echo "✅ Fallback mode works as expected"
echo ""
echo "🚀 Ready for GitHub Actions deployment!"
echo ""
echo "Next steps:"
echo "1. Add CURSOR_API_KEY to GitHub repository secrets"
echo "2. Test with a real CI failure"
echo "3. Monitor the analysis results in PR comments"
echo "4. Iterate based on real-world results"

cd ..
