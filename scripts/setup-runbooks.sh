#!/bin/bash

# Chef Chopsky Runbooks Setup Script
# This script helps set up and validate all runbooks and operational procedures

set -e

echo "📚 Chef Chopsky Runbooks Setup"
echo "=============================="

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
if [ ! -f "package.json" ] || [ ! -d "docs/projects/v6-deployment-environment-management" ]; then
    print_error "Please run this script from the root of the chef-chopsky repository"
    exit 1
fi

print_status "Setting up comprehensive runbooks and operational procedures..."

# Check if required runbook files exist
print_status "Checking required runbook files..."
required_runbooks=(
    "docs/projects/v6-deployment-environment-management/operations-runbook.md"
    "docs/projects/v6-deployment-environment-management/secrets-management-runbook.md"
    "docs/projects/v6-deployment-environment-management/rollback-procedures-runbook.md"
    "docs/projects/v6-deployment-environment-management/environment-setup-runbook.md"
    "docs/projects/v6-deployment-environment-management/monitoring-runbook.md"
    "docs/projects/v6-deployment-environment-management/monitoring-setup-guide.md"
)

for runbook in "${required_runbooks[@]}"; do
    if [ -f "$runbook" ]; then
        print_success "✓ $runbook exists"
    else
        print_error "✗ $runbook is missing"
        exit 1
    fi
done

# Check if required workflow files exist
print_status "Checking required workflow files..."
required_workflows=(
    ".github/workflows/production-deployment.yml"
    ".github/workflows/staging-deployment.yml"
    ".github/workflows/deployment-monitoring.yml"
    ".github/workflows/deployment-notifications.yml"
)

for workflow in "${required_workflows[@]}"; do
    if [ -f "$workflow" ]; then
        print_success "✓ $workflow exists"
    else
        print_error "✗ $workflow is missing"
        exit 1
    fi
done

# Check if required setup scripts exist
print_status "Checking required setup scripts..."
required_scripts=(
    "scripts/setup-production-deployment.sh"
    "scripts/setup-staging-deployment.sh"
    "scripts/setup-monitoring.sh"
)

for script in "${required_scripts[@]}"; do
    if [ -f "$script" ]; then
        print_success "✓ $script exists"
    else
        print_error "✗ $script is missing"
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

# Check if runbook secrets are configured
print_status "Checking runbook secrets configuration..."

# List of required secrets for runbooks
runbook_secrets=(
    "VERCEL_TOKEN"
    "VERCEL_PROJECT_ID"
    "RAILWAY_TOKEN"
    "RAILWAY_PROJECT_ID"
    "RAILWAY_STAGING_TOKEN"
    "RAILWAY_STAGING_PROJECT_ID"
    "PRODUCTION_SUPABASE_URL"
    "PRODUCTION_SUPABASE_PUBLISHABLE_KEY"
    "PRODUCTION_SUPABASE_SECRET_KEY"
    "STAGING_SUPABASE_URL"
    "STAGING_SUPABASE_PUBLISHABLE_KEY"
    "STAGING_SUPABASE_SECRET_KEY"
    "PRODUCTION_OPENAI_API_KEY"
    "STAGING_OPENAI_API_KEY"
    "LANGCHAIN_API_KEY"
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
    print_status "Checking runbook secrets in GitHub repository..."
    
    for secret in "${runbook_secrets[@]}"; do
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
    print_status "Please manually verify all required runbook secrets are configured:"
    for secret in "${runbook_secrets[@]}"; do
        echo "  - $secret"
    done
    echo ""
    print_status "Configure secrets at:"
    echo "  https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
fi

# Check runbook documentation completeness
print_status "Checking runbook documentation completeness..."

# Check if runbooks have required sections
runbook_sections=(
    "operations-runbook.md:Secrets Management"
    "operations-runbook.md:Environment Setup"
    "operations-runbook.md:Deployment Procedures"
    "operations-runbook.md:Rollback Procedures"
    "operations-runbook.md:Incident Response"
    "secrets-management-runbook.md:GitHub Secrets Management"
    "secrets-management-runbook.md:Service-Specific Secrets"
    "secrets-management-runbook.md:Secret Rotation Procedures"
    "rollback-procedures-runbook.md:Emergency Rollback Procedures"
    "rollback-procedures-runbook.md:Planned Rollback Procedures"
    "rollback-procedures-runbook.md:Database Rollback Procedures"
    "environment-setup-runbook.md:Production Environment Setup"
    "environment-setup-runbook.md:Staging Environment Setup"
    "environment-setup-runbook.md:Feature Environment Setup"
)

for section in "${runbook_sections[@]}"; do
    file=$(echo "$section" | cut -d: -f1)
    section_name=$(echo "$section" | cut -d: -f2)
    
    if grep -q "$section_name" "docs/projects/v6-deployment-environment-management/$file"; then
        print_success "✓ $file contains $section_name"
    else
        print_warning "✗ $file missing $section_name"
    fi
done

# Check workflow syntax
print_status "Testing workflow syntax..."

if command -v yamllint &> /dev/null; then
    for workflow in "${required_workflows[@]}"; do
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

# Check setup script executability
print_status "Checking setup script executability..."

for script in "${required_scripts[@]}"; do
    if [ -x "$script" ]; then
        print_success "✓ $script is executable"
    else
        print_warning "✗ $script is not executable"
        print_status "Making $script executable..."
        chmod +x "$script"
        print_success "✓ $script is now executable"
    fi
done

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

# Check runbook cross-references
print_status "Checking runbook cross-references..."

# Check if runbooks reference each other correctly
if grep -q "secrets-management-runbook.md" "docs/projects/v6-deployment-environment-management/operations-runbook.md"; then
    print_success "✓ Operations runbook references secrets management runbook"
else
    print_warning "✗ Operations runbook missing reference to secrets management runbook"
fi

if grep -q "rollback-procedures-runbook.md" "docs/projects/v6-deployment-environment-management/operations-runbook.md"; then
    print_success "✓ Operations runbook references rollback procedures runbook"
else
    print_warning "✗ Operations runbook missing reference to rollback procedures runbook"
fi

if grep -q "environment-setup-runbook.md" "docs/projects/v6-deployment-environment-management/operations-runbook.md"; then
    print_success "✓ Operations runbook references environment setup runbook"
else
    print_warning "✗ Operations runbook missing reference to environment setup runbook"
fi

# Summary and next steps
echo ""
echo "🎯 Runbooks Setup Summary"
echo "========================"

print_status "Comprehensive runbooks are configured with:"
echo "  ✓ Operations runbook with complete procedures"
echo "  ✓ Secrets management runbook with rotation procedures"
echo "  ✓ Rollback procedures runbook with emergency procedures"
echo "  ✓ Environment setup runbook with setup procedures"
echo "  ✓ Monitoring runbook with incident response procedures"
echo "  ✓ Monitoring setup guide with step-by-step instructions"

echo ""
print_status "Runbook features:"
echo "  • Complete operational procedures"
echo "  • Comprehensive secrets management"
echo "  • Emergency and planned rollback procedures"
echo "  • Environment setup and validation"
echo "  • Incident response and troubleshooting"
echo "  • Security best practices"
echo "  • Maintenance procedures"

echo ""
print_status "Next steps:"
echo "  1. Configure all required GitHub secrets (see secrets-management-runbook.md)"
echo "  2. Set up all service accounts and projects"
echo "  3. Configure monitoring and alerting"
echo "  4. Test all procedures in staging environment"
echo "  5. Train team on runbook procedures"
echo "  6. Conduct regular runbook reviews and updates"

echo ""
print_status "Useful commands:"
echo "  # Test production deployment workflow"
echo "  gh workflow run production-deployment.yml"
echo ""
echo "  # Test staging deployment workflow"
echo "  gh workflow run staging-deployment.yml"
echo ""
echo "  # Test monitoring workflow"
echo "  gh workflow run deployment-monitoring.yml"
echo ""
echo "  # Check workflow status"
echo "  gh run list --workflow=production-deployment.yml"
echo ""
echo "  # View workflow logs"
echo "  gh run view [RUN_ID] --log"

echo ""
print_status "Runbook locations:"
echo "  • Operations Runbook: docs/projects/v6-deployment-environment-management/operations-runbook.md"
echo "  • Secrets Management: docs/projects/v6-deployment-environment-management/secrets-management-runbook.md"
echo "  • Rollback Procedures: docs/projects/v6-deployment-environment-management/rollback-procedures-runbook.md"
echo "  • Environment Setup: docs/projects/v6-deployment-environment-management/environment-setup-runbook.md"
echo "  • Monitoring Runbook: docs/projects/v6-deployment-environment-management/monitoring-runbook.md"
echo "  • Monitoring Setup: docs/projects/v6-deployment-environment-management/monitoring-setup-guide.md"

echo ""
print_status "Setup scripts:"
echo "  • Production Setup: scripts/setup-production-deployment.sh"
echo "  • Staging Setup: scripts/setup-staging-deployment.sh"
echo "  • Monitoring Setup: scripts/setup-monitoring.sh"

echo ""
print_status "Service URLs to monitor:"
echo "  • Production Frontend: https://chef-chopsky-production.vercel.app"
echo "  • Production Agent: https://chef-chopsky-production.up.railway.app"
echo "  • Staging Frontend: https://chef-chopsky-git-staging.vercel.app"
echo "  • Staging Agent: https://chef-chopsky-staging.up.railway.app"

echo ""
print_status "Runbook maintenance:"
echo "  • Review runbooks quarterly"
echo "  • Update procedures as needed"
echo "  • Train team on new procedures"
echo "  • Conduct regular runbook audits"
echo "  • Keep runbooks current with system changes"

echo ""
print_success "Runbooks setup complete! 📚"
