#!/bin/bash

# Cursor CLI Setup Script for GitHub Actions
# This script helps set up Cursor CLI for automated CI failure analysis

set -e

echo "🚀 Setting up Cursor CLI for Auto-Fix System"

# Check if we're in a GitHub Actions environment
if [ -n "$GITHUB_ACTIONS" ]; then
    echo "✅ Running in GitHub Actions environment"
else
    echo "⚠️ Not in GitHub Actions - this script is designed for CI environments"
fi

# Install Cursor CLI
echo "📦 Installing Cursor CLI..."
curl -fsSL https://cursor.com/install | bash

# Add to PATH
echo "🔧 Adding Cursor CLI to PATH..."
export PATH="$HOME/.cursor/bin:$PATH"
echo "$HOME/.cursor/bin" >> $GITHUB_PATH

# Verify installation
echo "✅ Verifying Cursor CLI installation..."
if command -v cursor-agent &> /dev/null; then
    echo "✅ Cursor CLI installed successfully"
    cursor-agent --version || echo "⚠️ Version check failed, but CLI is available"
else
    echo "❌ Cursor CLI installation failed"
    exit 1
fi

# Check for API key
echo "🔑 Checking Cursor API key configuration..."
if [ -n "$CURSOR_API_KEY" ]; then
    echo "✅ Cursor API key is configured"
else
    echo "❌ CURSOR_API_KEY environment variable is not set"
    echo "Please set your Cursor API key in GitHub repository secrets"
    exit 1
fi

# Test basic functionality
echo "🧪 Testing Cursor CLI functionality..."
if cursor-agent --help &> /dev/null; then
    echo "✅ Cursor CLI is working correctly"
else
    echo "⚠️ Cursor CLI help command failed, but installation appears successful"
fi

echo "🎉 Cursor CLI setup complete!"
echo ""
echo "Next steps:"
echo "1. Ensure CURSOR_API_KEY is set in GitHub repository secrets"
echo "2. Test the auto-fix workflow with a CI failure"
echo "3. Monitor the analysis results in PR comments"
