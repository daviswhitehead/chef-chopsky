#!/bin/bash

# Test script for auto-fix functionality
# This script creates intentional CI failures to test the auto-fix workflow

set -e

echo "🧪 Testing Auto-Fix Functionality"
echo "=================================="

# Create a test branch
TEST_BRANCH="test-auto-fix-$(date +%s)"
echo "Creating test branch: $TEST_BRANCH"

# Checkout new branch
git checkout -b "$TEST_BRANCH"

# Create different types of failures
echo "Creating test failures..."

# 1. ESLint error
echo "Creating ESLint error..."
cat > frontend/test-eslint-error.tsx << 'EOF'
import React from 'react';

// This will cause an ESLint error (unused variable)
const unusedVariable = 'this will cause an error';

export default function TestComponent() {
  return <div>Test component with ESLint error</div>;
}
EOF

# 2. TypeScript error
echo "Creating TypeScript error..."
cat > frontend/test-typescript-error.ts << 'EOF'
// This will cause a TypeScript error (type mismatch)
const numberValue: number = "this is a string";
export default numberValue;
EOF

# 3. Test failure
echo "Creating test failure..."
cat > frontend/test-failing.test.ts << 'EOF'
describe('Failing Test', () => {
  it('should fail intentionally', () => {
    expect(true).toBe(false); // This will always fail
  });
});
EOF

# Commit the test failures
git add .
git commit -m "Add test failures for auto-fix testing

- ESLint error: unused variable
- TypeScript error: type mismatch  
- Test failure: intentional assertion failure"

echo "✅ Test failures created and committed"
echo "📝 Test failures:"
echo "   - ESLint error in frontend/test-eslint-error.tsx"
echo "   - TypeScript error in frontend/test-typescript-error.ts"
echo "   - Test failure in frontend/test-failing.test.ts"

echo ""
echo "🚀 Next steps:"
echo "1. Push this branch: git push origin $TEST_BRANCH"
echo "2. Create a PR from this branch"
echo "3. Wait for CI to fail"
echo "4. Check if auto-fix workflow triggers"
echo "5. Review the fix branch and PR comment"

echo ""
echo "🧹 To clean up after testing:"
echo "git checkout main"
echo "git branch -D $TEST_BRANCH"
echo "git push origin --delete $TEST_BRANCH"
