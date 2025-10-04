#!/bin/bash

# Chef Chopsky Staging Environment Validation Script
# This script validates that the staging environment is properly configured

set -e

echo "🔍 Chef Chopsky Staging Environment Validation"
echo "=============================================="

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

# Configuration
STAGING_FRONTEND_URL="https://chef-chopsky-git-staging.vercel.app"
STAGING_AGENT_URL="https://chef-chopsky-staging.up.railway.app"
HEALTH_ENDPOINT="/health"

# Test HTTP endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    print_status "Testing $description: $url"
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null); then
        if [ "$response" = "$expected_status" ]; then
            print_success "$description is responding correctly (HTTP $response)"
            return 0
        else
            print_error "$description returned HTTP $response (expected $expected_status)"
            return 1
        fi
    else
        print_error "$description is not accessible"
        return 1
    fi
}

# Test agent health endpoint
test_agent_health() {
    local url="${STAGING_AGENT_URL}${HEALTH_ENDPOINT}"
    
    print_status "Testing agent health endpoint: $url"
    
    if response=$(curl -s "$url" 2>/dev/null); then
        if echo "$response" | grep -q '"status":"ok"'; then
            print_success "Agent health check passed"
            
            # Extract and display environment info
            if echo "$response" | grep -q '"environment":"staging"'; then
                print_success "Agent is running in staging environment"
            else
                print_warning "Agent environment not confirmed as staging"
            fi
            
            return 0
        else
            print_error "Agent health check failed: $response"
            return 1
        fi
    else
        print_error "Agent health endpoint is not accessible"
        return 1
    fi
}

# Test frontend accessibility
test_frontend() {
    print_status "Testing frontend accessibility: $STAGING_FRONTEND_URL"
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" "$STAGING_FRONTEND_URL" 2>/dev/null); then
        if [ "$response" = "200" ]; then
            print_success "Frontend is accessible (HTTP $response)"
            return 0
        else
            print_error "Frontend returned HTTP $response"
            return 1
        fi
    else
        print_error "Frontend is not accessible"
        return 1
    fi
}

# Test CORS configuration
test_cors() {
    print_status "Testing CORS configuration"
    
    local cors_url="${STAGING_AGENT_URL}${HEALTH_ENDPOINT}"
    
    if response=$(curl -s -H "Origin: $STAGING_FRONTEND_URL" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS "$cors_url" 2>/dev/null); then
        if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
            print_success "CORS is properly configured"
            return 0
        else
            print_warning "CORS configuration may need attention"
            return 1
        fi
    else
        print_warning "Could not test CORS configuration"
        return 1
    fi
}

# Validate environment variables
validate_env_vars() {
    print_status "Validating environment configuration files"
    
    local errors=0
    
    # Check frontend staging env file
    if [ -f "frontend/.env.staging" ]; then
        print_success "Frontend staging environment file exists"
        
        # Check for required variables
        required_vars=(
            "NEXT_PUBLIC_SUPABASE_URL"
            "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
            "AGENT_SERVICE_URL"
            "NODE_ENV"
        )
        
        for var in "${required_vars[@]}"; do
            if grep -q "^${var}=" frontend/.env.staging; then
                print_success "Found required variable: $var"
            else
                print_error "Missing required variable: $var"
                errors=$((errors + 1))
            fi
        done
    else
        print_error "Frontend staging environment file not found"
        errors=$((errors + 1))
    fi
    
    # Check agent staging env file
    if [ -f "agent/.env.staging" ]; then
        print_success "Agent staging environment file exists"
        
        # Check for required variables
        required_vars=(
            "OPENAI_API_KEY"
            "FRONTEND_URL"
            "NODE_ENV"
            "RETRIEVER_PROVIDER"
        )
        
        for var in "${required_vars[@]}"; do
            if grep -q "^${var}=" agent/.env.staging; then
                print_success "Found required variable: $var"
            else
                print_error "Missing required variable: $var"
                errors=$((errors + 1))
            fi
        done
    else
        print_error "Agent staging environment file not found"
        errors=$((errors + 1))
    fi
    
    return $errors
}

# Main validation function
main() {
    local total_tests=0
    local passed_tests=0
    
    print_status "Starting staging environment validation..."
    echo ""
    
    # Test 1: Environment files
    print_status "=== Environment Configuration ==="
    if validate_env_vars; then
        passed_tests=$((passed_tests + 1))
    fi
    total_tests=$((total_tests + 1))
    echo ""
    
    # Test 2: Frontend accessibility
    print_status "=== Frontend Accessibility ==="
    if test_frontend; then
        passed_tests=$((passed_tests + 1))
    fi
    total_tests=$((total_tests + 1))
    echo ""
    
    # Test 3: Agent health
    print_status "=== Agent Health ==="
    if test_agent_health; then
        passed_tests=$((passed_tests + 1))
    fi
    total_tests=$((total_tests + 1))
    echo ""
    
    # Test 4: CORS configuration
    print_status "=== CORS Configuration ==="
    if test_cors; then
        passed_tests=$((passed_tests + 1))
    fi
    total_tests=$((total_tests + 1))
    echo ""
    
    # Summary
    print_status "=== Validation Summary ==="
    echo "Tests passed: $passed_tests/$total_tests"
    
    if [ $passed_tests -eq $total_tests ]; then
        print_success "All staging environment tests passed! 🎉"
        echo ""
        print_status "Staging environment is ready for use:"
        print_status "Frontend: $STAGING_FRONTEND_URL"
        print_status "Agent: $STAGING_AGENT_URL"
        return 0
    else
        print_error "Some tests failed. Please check the issues above."
        echo ""
        print_status "Common issues:"
        print_status "- Ensure all services are deployed and running"
        print_status "- Check environment variables are set correctly"
        print_status "- Verify URLs are accessible from your network"
        return 1
    fi
}

# Run main function
main "$@"