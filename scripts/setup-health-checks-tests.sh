#!/bin/bash

# Health Checks and Environment Separation Test Setup Script
# This script helps set up and validate automated testing for health checks and environment separation

set -e

echo "🧪 Chef Chopsky Health Checks and Environment Separation Test Setup"
echo "=================================================================="

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

print_status "Setting up automated health checks and environment separation tests..."

# Check if required test files exist
print_status "Checking required test files..."
required_test_files=(
    ".github/workflows/health-checks-and-environment-separation-tests.yml"
    "scripts/health-check.js"
    "frontend/tests/integration"
    "agent/src/__tests__"
)

for file in "${required_test_files[@]}"; do
    if [ -f "$file" ] || [ -d "$file" ]; then
        print_success "✓ $file exists"
    else
        print_warning "✗ $file is missing"
    fi
done

# Check if required workflow files exist
print_status "Checking required workflow files..."
required_workflows=(
    ".github/workflows/production-deployment.yml"
    ".github/workflows/staging-deployment.yml"
    ".github/workflows/deployment-monitoring.yml"
    ".github/workflows/health-checks-and-environment-separation-tests.yml"
)

for workflow in "${required_workflows[@]}"; do
    if [ -f "$workflow" ]; then
        print_success "✓ $workflow exists"
    else
        print_error "✗ $workflow is missing"
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
    print_warning "GitHub CLI is not installed. Install it for easier workflow management:"
    echo "  brew install gh  # macOS"
    echo "  apt install gh    # Ubuntu"
    echo "  choco install gh  # Windows"
fi

# Check if test secrets are configured
print_status "Checking test secrets configuration..."

# List of required secrets for testing
test_secrets=(
    "ALERT_WEBHOOK_URL"
    "PRODUCTION_SUPABASE_URL"
    "PRODUCTION_SUPABASE_PUBLISHABLE_KEY"
    "PRODUCTION_SUPABASE_SECRET_KEY"
    "STAGING_SUPABASE_URL"
    "STAGING_SUPABASE_PUBLISHABLE_KEY"
    "STAGING_SUPABASE_SECRET_KEY"
    "PRODUCTION_OPENAI_API_KEY"
    "STAGING_OPENAI_API_KEY"
    "LANGCHAIN_API_KEY"
)

if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    print_status "Checking test secrets in GitHub repository..."
    
    for secret in "${test_secrets[@]}"; do
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
    print_status "Please manually verify all required test secrets are configured:"
    for secret in "${test_secrets[@]}"; do
        echo "  - $secret"
    done
    echo ""
    print_status "Configure secrets at:"
    echo "  https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
fi

# Check if required tools are available
print_status "Checking required tools..."

# Check if curl is available
if command -v curl &> /dev/null; then
    print_success "✓ curl is available for health checks"
else
    print_warning "✗ curl is not available. Install it for health checks:"
    echo "  brew install curl  # macOS"
    echo "  apt install curl    # Ubuntu"
fi

# Check if jq is available
if command -v jq &> /dev/null; then
    print_success "✓ jq is available for JSON parsing"
else
    print_warning "✗ jq is not available. Install it for JSON parsing:"
    echo "  brew install jq  # macOS"
    echo "  apt install jq    # Ubuntu"
fi

# Check if Node.js is available
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "✓ Node.js is available ($NODE_VERSION)"
else
    print_warning "✗ Node.js is not available. Install it for testing:"
    echo "  brew install node  # macOS"
    echo "  apt install nodejs # Ubuntu"
fi

# Check if npm is available
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "✓ npm is available ($NPM_VERSION)"
else
    print_warning "✗ npm is not available. Install it for testing:"
    echo "  brew install npm  # macOS"
    echo "  apt install npm   # Ubuntu"
fi

# Test workflow syntax
print_status "Testing workflow syntax..."

if command -v yamllint &> /dev/null; then
    if yamllint .github/workflows/health-checks-and-environment-separation-tests.yml &> /dev/null; then
        print_success "✓ health-checks-and-environment-separation-tests.yml syntax is valid"
    else
        print_warning "✗ health-checks-and-environment-separation-tests.yml has syntax issues"
    fi
else
    print_warning "yamllint not available. Install it to validate YAML syntax:"
    echo "  pip install yamllint"
fi

# Check existing test infrastructure
print_status "Checking existing test infrastructure..."

if [ -f "frontend/package.json" ]; then
    print_success "✓ Frontend package.json exists"
    
    # Check if frontend has test scripts
    if grep -q "test" frontend/package.json; then
        print_success "✓ Frontend test scripts exist"
    else
        print_warning "✗ Frontend test scripts missing"
    fi
else
    print_warning "✗ Frontend package.json missing"
fi

if [ -f "agent/package.json" ]; then
    print_success "✓ Agent package.json exists"
    
    # Check if agent has test scripts
    if grep -q "test" agent/package.json; then
        print_success "✓ Agent test scripts exist"
    else
        print_warning "✗ Agent test scripts missing"
    fi
else
    print_warning "✗ Agent package.json missing"
fi

# Test service URLs
print_status "Testing service URLs..."

# Test production URLs
PROD_FRONTEND="https://chef-chopsky-production.vercel.app"
PROD_AGENT="https://chef-chopsky-production.up.railway.app"

if curl -s -o /dev/null -w "%{http_code}" "$PROD_FRONTEND" | grep -q "200"; then
    print_success "✓ Production frontend is accessible"
else
    print_warning "✗ Production frontend is not accessible"
fi

if curl -s -o /dev/null -w "%{http_code}" "$PROD_AGENT/health" | grep -q "200"; then
    print_success "✓ Production agent is accessible"
else
    print_warning "✗ Production agent is not accessible"
fi

# Test staging URLs
STAGING_FRONTEND="https://chef-chopsky-git-staging.vercel.app"
STAGING_AGENT="https://chef-chopsky-staging.up.railway.app"

if curl -s -o /dev/null -w "%{http_code}" "$STAGING_FRONTEND" | grep -q "200"; then
    print_success "✓ Staging frontend is accessible"
else
    print_warning "✗ Staging frontend is not accessible"
fi

if curl -s -o /dev/null -w "%{http_code}" "$STAGING_AGENT/health" | grep -q "200"; then
    print_success "✓ Staging agent is accessible"
else
    print_warning "✗ Staging agent is not accessible"
fi

# Test health check endpoints
print_status "Testing health check endpoints..."

# Test production agent health
PROD_HEALTH=$(curl -s "$PROD_AGENT/health" | jq -r '.status' 2>/dev/null || echo "unknown")
if [ "$PROD_HEALTH" == "ok" ]; then
    print_success "✓ Production agent health endpoint is working"
else
    print_warning "✗ Production agent health endpoint is not working ($PROD_HEALTH)"
fi

# Test staging agent health
STAGING_HEALTH=$(curl -s "$STAGING_AGENT/health" | jq -r '.status' 2>/dev/null || echo "unknown")
if [ "$STAGING_HEALTH" == "ok" ]; then
    print_success "✓ Staging agent health endpoint is working"
else
    print_warning "✗ Staging agent health endpoint is not working ($STAGING_HEALTH)"
fi

# Test configuration endpoints
print_status "Testing configuration endpoints..."

# Test production agent config
PROD_CONFIG=$(curl -s "$PROD_AGENT/config" 2>/dev/null || echo '{"error":"unavailable"}')
if echo "$PROD_CONFIG" | jq -e '.appEnv' > /dev/null 2>&1; then
    PROD_APP_ENV=$(echo "$PROD_CONFIG" | jq -r '.appEnv')
    print_success "✓ Production agent config endpoint is working (APP_ENV: $PROD_APP_ENV)"
else
    print_warning "✗ Production agent config endpoint is not working"
fi

# Test staging agent config
STAGING_CONFIG=$(curl -s "$STAGING_AGENT/config" 2>/dev/null || echo '{"error":"unavailable"}')
if echo "$STAGING_CONFIG" | jq -e '.appEnv' > /dev/null 2>&1; then
    STAGING_APP_ENV=$(echo "$STAGING_CONFIG" | jq -r '.appEnv')
    print_success "✓ Staging agent config endpoint is working (APP_ENV: $STAGING_APP_ENV)"
else
    print_warning "✗ Staging agent config endpoint is not working"
fi

# Test environment separation
print_status "Testing environment separation..."

if [ "$PROD_APP_ENV" == "production" ] && [ "$STAGING_APP_ENV" == "staging" ]; then
    print_success "✓ Environment separation is working correctly"
else
    print_warning "✗ Environment separation is not working correctly (Prod: $PROD_APP_ENV, Staging: $STAGING_APP_ENV)"
fi

# Check test coverage
print_status "Checking test coverage..."

# Check if health check tests exist
if [ -f ".github/workflows/health-checks-and-environment-separation-tests.yml" ]; then
    print_success "✓ Health check tests workflow exists"
else
    print_warning "✗ Health check tests workflow missing"
fi

# Check if integration tests exist
if [ -d "frontend/tests/integration" ]; then
    print_success "✓ Frontend integration tests exist"
else
    print_warning "✗ Frontend integration tests missing"
fi

# Check if agent tests exist
if [ -d "agent/src/__tests__" ]; then
    print_success "✓ Agent tests exist"
else
    print_warning "✗ Agent tests missing"
fi

# Summary and next steps
echo ""
echo "🎯 Test Setup Summary"
echo "===================="

print_status "Automated testing is configured with:"
echo "  ✓ Health checks for all environments"
echo "  ✓ Environment separation validation"
echo "  ✓ Production environment validation"
echo "  ✓ Staging environment validation"
echo "  ✓ Data isolation verification"
echo "  ✓ Retriever configuration validation"
echo "  ✓ Environment discriminator validation"

echo ""
print_status "Test features:"
echo "  • Automated health checks every hour"
echo "  • Environment separation validation"
echo "  • Production environment guards"
echo "  • Staging environment validation"
echo "  • Data isolation verification"
echo "  • Retriever configuration validation"
echo "  • Environment discriminator validation"
echo "  • Automated test notifications"

echo ""
print_status "Next steps:"
echo "  1. Configure all required GitHub secrets (see test secrets list above)"
echo "  2. Verify all service URLs are accessible"
echo "  3. Test health check workflow manually"
echo "  4. Verify environment separation is working"
echo "  5. Monitor test results and notifications"
echo "  6. Review and update test thresholds as needed"

echo ""
print_status "Useful commands:"
echo "  # Test health check workflow manually"
echo "  gh workflow run health-checks-and-environment-separation-tests.yml"
echo ""
echo "  # Check workflow status"
echo "  gh run list --workflow=health-checks-and-environment-separation-tests.yml"
echo ""
echo "  # View workflow logs"
echo "  gh run view [RUN_ID] --log"
echo ""
echo "  # Test health checks locally"
echo "  npm run health:check"

echo ""
print_status "Service URLs to test:"
echo "  • Production Frontend: https://chef-chopsky-production.vercel.app"
echo "  • Production Agent: https://chef-chopsky-production.up.railway.app"
echo "  • Staging Frontend: https://chef-chopsky-git-staging.vercel.app"
echo "  • Staging Agent: https://chef-chopsky-staging.up.railway.app"

echo ""
print_status "Test endpoints:"
echo "  • Health Check: /health"
echo "  • Configuration: /config"
echo "  • Frontend Health: /api/health"

echo ""
print_status "Test validation:"
echo "  • Environment separation (production vs staging)"
echo "  • Data isolation (different vector stores)"
echo "  • Retriever configuration (production-ready vs staging)"
echo "  • Environment discriminators (env=production|staging)"
echo "  • Production guards (API key validation)"
echo "  • Service health (all endpoints responding)"

echo ""
print_status "Test maintenance:"
echo "  • Review test results regularly"
echo "  • Update test thresholds as needed"
echo "  • Monitor test notifications"
echo "  • Keep test documentation current"
echo "  • Review and update test coverage"

echo ""
print_success "Health checks and environment separation test setup complete! 🧪"
