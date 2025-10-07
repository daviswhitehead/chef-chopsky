#!/bin/bash

# Production Deployment Setup Script
# This script helps configure the automated production deployment workflow

set -e

echo "🚀 Chef Chopsky Production Deployment Setup"
echo "=========================================="

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

print_status "Setting up production deployment configuration..."

# Check if required files exist
print_status "Checking required files..."
required_files=(
    ".github/workflows/production-deployment.yml"
    ".github/workflows/deployment-notifications.yml"
    "docs/projects/v6-deployment-environment-management/production-secrets-guide.md"
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

# List of required secrets
required_secrets=(
    "VERCEL_TOKEN"
    "VERCEL_PROJECT_ID"
    "RAILWAY_TOKEN"
    "RAILWAY_PROJECT_ID"
    "PRODUCTION_SUPABASE_URL"
    "PRODUCTION_SUPABASE_PUBLISHABLE_KEY"
    "PRODUCTION_SUPABASE_SECRET_KEY"
    "PRODUCTION_OPENAI_API_KEY"
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

# Check Railway configuration
if [ -f "agent/railway.toml" ]; then
    print_success "✓ Railway configuration exists"
else
    print_warning "✗ Railway configuration missing. Consider creating agent/railway.toml"
fi

# Check environment configuration
print_status "Checking environment configuration..."

if [ -f "agent/.env.example" ]; then
    print_success "✓ Agent environment example exists"
else
    print_warning "✗ Agent environment example missing"
fi

if [ -f "frontend/.env.example" ]; then
    print_success "✓ Frontend environment example exists"
else
    print_warning "✗ Frontend environment example missing"
fi

# Test workflow syntax
print_status "Testing workflow syntax..."

if command -v yamllint &> /dev/null; then
    for workflow in .github/workflows/production-deployment.yml .github/workflows/deployment-notifications.yml; do
        if yamllint "$workflow" &> /dev/null; then
            print_success "✓ $workflow syntax is valid"
        else
            print_warning "✗ $workflow has syntax issues"
        fi
    done
else
    print_warning "yamllint not available. Install it to validate YAML syntax:"
    echo "  pip install yamllint"
fi

# Summary and next steps
echo ""
echo "🎯 Setup Summary"
echo "================"

print_status "Production deployment workflow is configured with:"
echo "  ✓ Automated deployment on main branch pushes"
echo "  ✓ Manual deployment trigger"
echo "  ✓ Pre-deployment validation and testing"
echo "  ✓ Railway agent service deployment"
echo "  ✓ Vercel frontend deployment"
echo "  ✓ Post-deployment health checks"
echo "  ✓ Deployment notifications"

echo ""
print_status "Next steps:"
echo "  1. Configure all required GitHub secrets (see production-secrets-guide.md)"
echo "  2. Test the workflow with a small change to main branch"
echo "  3. Verify production URLs are accessible"
echo "  4. Set up monitoring and alerting"
echo "  5. Document rollback procedures"

echo ""
print_status "Useful commands:"
echo "  # Test workflow manually"
echo "  gh workflow run production-deployment.yml"
echo ""
echo "  # Check workflow status"
echo "  gh run list --workflow=production-deployment.yml"
echo ""
echo "  # View workflow logs"
echo "  gh run view [RUN_ID] --log"

echo ""
print_success "Production deployment setup complete! 🚀"