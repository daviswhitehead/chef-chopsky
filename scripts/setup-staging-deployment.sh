#!/bin/bash

# Staging Deployment Setup Script
# This script helps configure the automated staging deployment workflow

set -e

echo "🚀 Chef Chopsky Staging Deployment Setup"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d ".github/workflows" ]; then
    print_error "Please run this script from the root of the chef-chopsky repository"
    exit 1
fi

print_status "Setting up staging deployment configuration..."

# Check if required files exist
print_status "Checking required files..."
required_files=(
    ".github/workflows/staging-deployment.yml"
    "docs/projects/v6-deployment-environment-management/staging-secrets-guide.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file is missing"
        exit 1
    fi
done

# Check GitHub CLI availability
if command -v gh &> /dev/null; then
    print_success "✓ GitHub CLI is available"
    
    # Check if user is authenticated
    if gh auth status &> /dev/null; then
        print_success "✓ GitHub CLI is authenticated"
        
        # Get repository info
        REPO_OWNER=$(gh repo view --json owner --jq '.owner.login')
        REPO_NAME=$(gh repo view --json name --jq '.name')
        print_status "Repository: $REPO_OWNER/$REPO_NAME"
        
    else
        print_warning "GitHub CLI is not authenticated. Run 'gh auth login' to authenticate."
    fi
else
    print_warning "GitHub CLI is not installed. Install it for easier secret management:"
    echo "  brew install gh  # macOS"
    echo "  apt install gh    # Ubuntu"
    echo "  choco install gh  # Windows"
fi

# Check if secrets are configured
print_status "Checking GitHub secrets configuration..."

# List of required secrets for staging
required_secrets=(
    "VERCEL_TOKEN"
    "VERCEL_PROJECT_ID"
    "RAILWAY_STAGING_TOKEN"
    "RAILWAY_STAGING_PROJECT_ID"
    "STAGING_SUPABASE_URL"
    "STAGING_SUPABASE_PUBLISHABLE_KEY"
    "STAGING_SUPABASE_SECRET_KEY"
    "STAGING_OPENAI_API_KEY"
    "LANGCHAIN_API_KEY"
)

if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    print_status "Checking secrets in GitHub repository..."
    
    for secret in "${required_secrets[@]}"; do
        if gh secret list | grep -q "$secret"; then
            print_success "✓ $secret is configured"
        else
            print_warning "✗ $secret is missing"
        fi
    done
    
    echo ""
    print_status "To add missing secrets, use:"
    echo "  gh secret set SECRET_NAME --body 'SECRET_VALUE'"
    echo ""
    print_status "Or use the GitHub web interface:"
    echo "  https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
    
else
    print_warning "Cannot check secrets without GitHub CLI authentication"
    print_status "Please manually verify all required secrets are configured:"
    for secret in "${required_secrets[@]}"; do
        echo "  - $secret"
    done
    echo ""
    print_status "Configure secrets at:"
    echo "  https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
fi

# Check deployment platforms
print_status "Checking deployment platform configurations..."

# Check Vercel configuration
if [ -f "frontend/vercel.json" ]; then
    print_success "✓ Vercel configuration exists"
else
    print_warning "✗ Vercel configuration missing. Consider creating frontend/vercel.json"
fi

# Check Railway staging configuration
if [ -f "agent/railway-staging.toml" ]; then
    print_success "✓ Railway staging configuration exists"
else
    print_warning "✗ Railway staging configuration missing. Consider creating agent/railway-staging.toml"
fi

# Check environment configuration
print_status "Checking environment configuration..."

if [ -f "agent/.env.staging.example" ]; then
    print_success "✓ Agent staging environment example exists"
else
    print_warning "✗ Agent staging environment example missing"
fi

if [ -f "frontend/.env.staging.example" ]; then
    print_success "✓ Frontend staging environment example exists"
else
    print_warning "✗ Frontend staging environment example missing"
fi

# Test workflow syntax
print_status "Testing workflow syntax..."

if command -v yamllint &> /dev/null; then
    if yamllint .github/workflows/staging-deployment.yml &> /dev/null; then
        print_success "✓ staging-deployment.yml syntax is valid"
    else
        print_warning "✗ staging-deployment.yml has syntax issues"
    fi
else
    print_warning "yamllint not available. Install it to validate YAML syntax:"
    echo "  pip install yamllint"
fi

# Check branch strategy
print_status "Checking branch strategy..."

if git branch -r | grep -q "origin/staging"; then
    print_success "✓ Staging branch exists"
else
    print_warning "✗ Staging branch does not exist. Create it with:"
    echo "  git checkout -b staging"
    echo "  git push -u origin staging"
fi

# Check for feature branches
FEATURE_BRANCHES=$(git branch -r | grep -E "(feat|feature)/" | wc -l)
if [ "$FEATURE_BRANCHES" -gt 0 ]; then
    print_success "✓ Found $FEATURE_BRANCHES feature branch(es)"
else
    print_warning "✗ No feature branches found. Create one to test staging deployment:"
    echo "  git checkout -b feat/test-staging"
    echo "  git push -u origin feat/test-staging"
fi

# Summary and next steps
echo ""
echo "🎯 Setup Summary"
echo "================"

print_status "Staging deployment workflow is configured with:"
echo "  ✓ Automated deployment on staging branch pushes"
echo "  ✓ Automated deployment on feature branch pushes (feat/*, feature/*)"
echo "  ✓ Pull request validation deployments"
echo "  ✓ Manual deployment trigger"
echo "  ✓ Pre-deployment validation and testing"
echo "  ✓ Railway staging agent service deployment"
echo "  ✓ Vercel preview frontend deployment"
echo "  ✓ Post-deployment health checks"
echo "  ✓ Staging deployment notifications"

echo ""
print_status "Deployment URLs:"
echo "  • Staging branch: https://chef-chopsky-git-staging.vercel.app"
echo "  • Feature branches: https://chef-chopsky-git-{branch-name}.vercel.app"
echo "  • Agent (shared): https://chef-chopsky-staging.up.railway.app"

echo ""
print_status "Next steps:"
echo "  1. Configure all required GitHub secrets (see staging-secrets-guide.md)"
echo "  2. Create staging branch if it doesn't exist"
echo "  3. Test the workflow with a small change to staging branch"
echo "  4. Test feature branch deployment with feat/test-staging"
echo "  5. Verify staging URLs are accessible"
echo "  6. Set up staging access control (password protection)"
echo "  7. Configure monitoring and alerting for staging"

echo ""
print_status "Useful commands:"
echo "  # Test staging workflow manually"
echo "  gh workflow run staging-deployment.yml --ref staging"
echo ""
echo "  # Test feature branch workflow"
echo "  gh workflow run staging-deployment.yml --ref feat/test-staging"
echo ""
echo "  # Check workflow status"
echo "  gh run list --workflow=staging-deployment.yml"
echo ""
echo "  # View workflow logs"
echo "  gh run view [RUN_ID] --log"

echo ""
print_status "Branch strategy:"
echo "  • main → Production deployment"
echo "  • staging → Staging deployment"
echo "  • feat/* → Feature branch staging deployment"
echo "  • feature/* → Feature branch staging deployment"

echo ""
print_success "Staging deployment setup complete! 🚀"
