#!/bin/bash

# Chef Chopsky Staging Environment Setup Script
# This script helps set up the complete staging environment

set -e

echo "🚀 Chef Chopsky Staging Environment Setup"
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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check if required tools are installed
    command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed. Aborting."; exit 1; }
    command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed. Aborting."; exit 1; }
    
    print_success "Prerequisites check passed"
}

# Create staging environment files
create_staging_files() {
    print_status "Creating staging environment files..."
    
    # Copy example files to staging versions
    if [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env.staging
        print_success "Created frontend/.env.staging"
    fi
    
    if [ -f "agent/.env.example" ]; then
        cp agent/.env.example agent/.env.staging
        print_success "Created agent/.env.staging"
    fi
    
    print_warning "Please update the staging environment files with actual values:"
    print_warning "- frontend/.env.staging"
    print_warning "- agent/.env.staging"
}

# Validate staging configuration
validate_staging_config() {
    print_status "Validating staging configuration..."
    
    # Check if staging files exist
    if [ ! -f "frontend/.env.staging" ]; then
        print_error "frontend/.env.staging not found"
        return 1
    fi
    
    if [ ! -f "agent/.env.staging" ]; then
        print_error "agent/.env.staging not found"
        return 1
    fi
    
    # Check for required variables in frontend
    required_frontend_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
        "AGENT_SERVICE_URL"
    )
    
    for var in "${required_frontend_vars[@]}"; do
        if ! grep -q "^${var}=" frontend/.env.staging; then
            print_warning "Missing required variable: ${var}"
        fi
    done
    
    # Check for required variables in agent
    required_agent_vars=(
        "OPENAI_API_KEY"
        "FRONTEND_URL"
        "NODE_ENV"
    )
    
    for var in "${required_agent_vars[@]}"; do
        if ! grep -q "^${var}=" agent/.env.staging; then
            print_warning "Missing required variable: ${var}"
        fi
    done
    
    print_success "Configuration validation completed"
}

# Display setup instructions
display_setup_instructions() {
    echo ""
    echo "📋 Manual Setup Required"
    echo "========================"
    echo ""
    echo "1. Configure Vercel Environment Variables:"
    echo "   - Go to https://vercel.com/dashboard"
    echo "   - Select existing project: chef-chopsky"
    echo "   - Go to Settings → Environment Variables"
    echo "   - Configure Production environment variables (main branch)"
    echo "   - Configure Preview environment variables (staging + feature branches)"
    echo ""
    echo "2. Create Supabase Staging Project:"
    echo "   - Go to https://supabase.com/dashboard"
    echo "   - Create new project: chef-chopsky-staging"
    echo "   - Apply database schema from production"
    echo "   - Update frontend/.env.staging with new Supabase credentials"
    echo ""
    echo "3. Create Railway Staging Project:"
    echo "   - Go to https://railway.app/dashboard"
    echo "   - Create new project: chef-chopsky-staging"
    echo "   - Set root directory to: agent/"
    echo "   - Configure environment variables from agent/.env.staging"
    echo ""
    echo "4. Create Staging Branch:"
    echo "   - git checkout -b staging"
    echo "   - git push origin staging"
    echo "   - This creates: https://chef-chopsky-git-staging.vercel.app"
    echo ""
    echo "5. Test Staging Environment:"
    echo "   - Frontend: https://chef-chopsky-git-staging.vercel.app"
    echo "   - Agent: https://chef-chopsky-staging.up.railway.app/health"
    echo ""
    echo "📖 For detailed instructions, see:"
    echo "   docs/projects/v6-deployment-environment-management/staging-setup-guide.md"
}

# Main execution
main() {
    check_prerequisites
    create_staging_files
    validate_staging_config
    display_setup_instructions
    
    echo ""
    print_success "Staging environment setup script completed!"
    print_warning "Remember to complete the manual setup steps above"
}

# Run main function
main "$@"