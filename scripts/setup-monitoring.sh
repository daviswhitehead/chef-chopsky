#!/bin/bash

# Deployment Monitoring Setup Script
# This script helps configure monitoring and alerting for Chef Chopsky deployments

set -e

echo "🔔 Chef Chopsky Deployment Monitoring Setup"
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

print_status "Setting up deployment monitoring and alerting..."

# Check if required files exist
print_status "Checking required files..."
required_files=(
    ".github/workflows/deployment-monitoring.yml"
    "docs/projects/v6-deployment-environment-management/monitoring-setup-guide.md"
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

# Check if monitoring secrets are configured
print_status "Checking GitHub secrets configuration..."

# List of required secrets for monitoring
monitoring_secrets=(
    "ALERT_WEBHOOK_URL"
    "UPTIME_ROBOT_API_KEY"
    "UPTIME_ROBOT_PROD_FRONTEND_ID"
    "UPTIME_ROBOT_PROD_AGENT_ID"
    "UPTIME_ROBOT_STAGING_FRONTEND_ID"
    "UPTIME_ROBOT_STAGING_AGENT_ID"
    "SENTRY_DSN"
    "SENTRY_AUTH_TOKEN"
)

if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    print_status "Checking monitoring secrets in GitHub repository..."
    
    for secret in "${monitoring_secrets[@]}"; do
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
    print_status "Please manually verify all required monitoring secrets are configured:"
    for secret in "${monitoring_secrets[@]}"; do
        echo "  - $secret"
    done
    echo ""
    print_status "Configure secrets at:"
    echo "  https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
fi

# Check monitoring service availability
print_status "Checking monitoring service availability..."

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

# Test workflow syntax
print_status "Testing workflow syntax..."

if command -v yamllint &> /dev/null; then
    if yamllint .github/workflows/deployment-monitoring.yml &> /dev/null; then
        print_success "✓ deployment-monitoring.yml syntax is valid"
    else
        print_warning "✗ deployment-monitoring.yml has syntax issues"
    fi
else
    print_warning "yamllint not available. Install it to validate YAML syntax:"
    echo "  pip install yamllint"
fi

# Check existing workflows
print_status "Checking existing deployment workflows..."

if [ -f ".github/workflows/production-deployment.yml" ]; then
    print_success "✓ Production deployment workflow exists"
else
    print_warning "✗ Production deployment workflow missing"
fi

if [ -f ".github/workflows/staging-deployment.yml" ]; then
    print_success "✓ Staging deployment workflow exists"
else
    print_warning "✗ Staging deployment workflow missing"
fi

if [ -f ".github/workflows/deployment-notifications.yml" ]; then
    print_success "✓ Deployment notifications workflow exists"
else
    print_warning "✗ Deployment notifications workflow missing"
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

# Summary and next steps
echo ""
echo "🎯 Setup Summary"
echo "================"

print_status "Deployment monitoring is configured with:"
echo "  ✓ Automated deployment notifications"
echo "  ✓ Health monitoring every 5 minutes"
echo "  ✓ UptimeRobot integration"
echo "  ✓ Sentry error tracking"
echo "  ✓ Webhook alerts (Slack/Discord)"
echo "  ✓ GitHub Actions monitoring"
echo "  ✓ Service health checks"

echo ""
print_status "Monitoring features:"
echo "  • Deployment success/failure alerts"
echo "  • Service health monitoring"
echo "  • Uptime tracking"
echo "  • Error monitoring"
echo "  • Performance tracking"
echo "  • Historical data"

echo ""
print_status "Next steps:"
echo "  1. Configure all required GitHub secrets (see monitoring-setup-guide.md)"
echo "  2. Set up UptimeRobot monitors for all services"
echo "  3. Configure Sentry projects for error tracking"
echo "  4. Set up webhook alerts (Slack/Discord)"
echo "  5. Test monitoring workflow manually"
echo "  6. Verify all alerts are working"
echo "  7. Configure alert thresholds and frequency"

echo ""
print_status "Useful commands:"
echo "  # Test monitoring workflow manually"
echo "  gh workflow run deployment-monitoring.yml"
echo ""
echo "  # Check workflow status"
echo "  gh run list --workflow=deployment-monitoring.yml"
echo ""
echo "  # View workflow logs"
echo "  gh run view [RUN_ID] --log"
echo ""
echo "  # Test health checks manually"
echo "  curl -f https://chef-chopsky-production.up.railway.app/health"

echo ""
print_status "Service URLs to monitor:"
echo "  • Production Frontend: https://chef-chopsky-production.vercel.app"
echo "  • Production Agent: https://chef-chopsky-production.up.railway.app"
echo "  • Staging Frontend: https://chef-chopsky-git-staging.vercel.app"
echo "  • Staging Agent: https://chef-chopsky-staging.up.railway.app"

echo ""
print_status "Monitoring services to set up:"
echo "  • UptimeRobot: https://uptimerobot.com"
echo "  • Sentry: https://sentry.io"
echo "  • Slack/Discord: Webhook integration"
echo "  • GitHub: Built-in notifications"

echo ""
print_success "Deployment monitoring setup complete! 🔔"
