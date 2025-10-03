#!/bin/bash

# Automated Production Environment Setup
# Sets up all required environment variables for production deployment

set -e

echo "🚀 Automated Production Environment Setup"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SUPABASE_PROJECT_REF="wlycgcwsnbhqeojjwjpo"
VERCEL_PROJECT="chef-chopsky"
ENVIRONMENT="production"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI not found${NC}"
        echo -e "${YELLOW}Installing Vercel CLI...${NC}"
        npm install -g vercel
    fi
    echo -e "${GREEN}✅ Vercel CLI available${NC}"
    
    # Check if logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        echo -e "${RED}❌ Not logged in to Vercel${NC}"
        echo -e "${YELLOW}Please run: vercel login${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Logged in to Vercel${NC}"
    
    # Check Supabase CLI
    if ! command -v supabase &> /dev/null; then
        echo -e "${YELLOW}⚠️  Supabase CLI not found (optional)${NC}"
    else
        echo -e "${GREEN}✅ Supabase CLI available${NC}"
    fi
}

# Function to get Supabase credentials from environment file
get_supabase_credentials() {
    echo -e "${BLUE}🔑 Getting Supabase credentials from environment file...${NC}"
    
    # Check if .env.production exists
    if [ ! -f "frontend/.env.production" ]; then
        echo -e "${RED}❌ frontend/.env.production file not found${NC}"
        echo -e "${YELLOW}Please create frontend/.env.production with your production environment variables${NC}"
        echo -e "${YELLOW}You can copy from frontend/.env.example and fill in the values${NC}"
        exit 1
    fi
    
    # Source the environment file
    source frontend/.env.production
    
    # Check if SUPABASE_SECRET_KEY is set and not placeholder
    if [ -z "$SUPABASE_SECRET_KEY" ] || [ "$SUPABASE_SECRET_KEY" = "your_supabase_secret_key_here" ]; then
        echo -e "${RED}❌ SUPABASE_SECRET_KEY not set or still placeholder in frontend/.env.production${NC}"
        echo -e "${YELLOW}Please update frontend/.env.production with your actual secret key${NC}"
        exit 1
    fi
    
    # Validate key format
    if [[ ! $SUPABASE_SECRET_KEY =~ ^sb_secret_ ]]; then
        echo -e "${RED}❌ Invalid secret key format in frontend/.env.production${NC}"
        echo -e "${YELLOW}Secret key should start with 'sb_secret_...'${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Secret key loaded from frontend/.env.production${NC}"
}

# Function to set Vercel environment variables
set_vercel_env_vars() {
    echo -e "${BLUE}🔄 Setting Vercel environment variables...${NC}"
    
    # Define environment variables
    declare -A env_vars=(
        ["NEXT_PUBLIC_SUPABASE_URL"]="https://${SUPABASE_PROJECT_REF}.supabase.co"
        ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]="sb_publishable_5Z33oH3ZdsxtVuGGWSwbig_JXW7IXT6"
        ["SUPABASE_SECRET_KEY"]="$SUPABASE_SECRET_KEY"
        ["AGENT_SERVICE_URL"]="https://chef-chopsky-production.up.railway.app"
        ["NODE_ENV"]="production"
        ["NEXT_PUBLIC_APP_ENV"]="production"
    )
    
    # Set each environment variable
    for var_name in "${!env_vars[@]}"; do
        var_value="${env_vars[$var_name]}"
        
        echo -e "${BLUE}🔄 Setting ${var_name}...${NC}"
        
        # Remove existing variable if it exists
        if vercel env ls | grep -q "${var_name}"; then
            echo -e "${YELLOW}⚠️  ${var_name} already exists, updating...${NC}"
            vercel env rm "${var_name}" "${ENVIRONMENT}" --yes
        fi
        
        # Add the variable
        echo "${var_value}" | vercel env add "${var_name}" "${ENVIRONMENT}"
        echo -e "${GREEN}✅ ${var_name} set successfully${NC}"
    done
}

# Function to verify environment setup
verify_setup() {
    echo -e "${BLUE}🔍 Verifying environment setup...${NC}"
    
    # Check environment variables
    echo -e "${BLUE}📋 Current Vercel environment variables:${NC}"
    vercel env ls
    
    # Test Supabase connection
    echo -e "${BLUE}🔗 Testing Supabase connection...${NC}"
    local test_url="https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/conversations"
    local test_key="sb_publishable_5Z33oH3ZdsxtVuGGWSwbig_JXW7IXT6"
    
    if curl -s -H "apikey: ${test_key}" -H "Authorization: Bearer ${test_key}" "${test_url}" | grep -q "id"; then
        echo -e "${GREEN}✅ Supabase connection successful${NC}"
    else
        echo -e "${RED}❌ Supabase connection failed${NC}"
        return 1
    fi
    
    # Test agent connection
    echo -e "${BLUE}🤖 Testing agent connection...${NC}"
    if curl -s "https://chef-chopsky-production.up.railway.app/health" | grep -q "ok"; then
        echo -e "${GREEN}✅ Agent connection successful${NC}"
    else
        echo -e "${RED}❌ Agent connection failed${NC}"
        return 1
    fi
}

# Function to redeploy frontend
redeploy_frontend() {
    echo -e "${BLUE}🚀 Redeploying frontend with new environment variables...${NC}"
    
    cd frontend
    vercel --prod --yes
    cd ..
    
    echo -e "${GREEN}✅ Frontend redeployed successfully${NC}"
}

# Function to run production tests
run_production_tests() {
    echo -e "${BLUE}🧪 Running production tests...${NC}"
    
    cd frontend
    
    # Run health check test
    echo -e "${BLUE}🏥 Running health check test...${NC}"
    if npm run test:e2e:production -- --grep "production services health check"; then
        echo -e "${GREEN}✅ Health check test passed${NC}"
    else
        echo -e "${RED}❌ Health check test failed${NC}"
        return 1
    fi
    
    # Run home page test
    echo -e "${BLUE}🏠 Running home page test...${NC}"
    if npm run test:e2e:production -- --grep "production home page loads correctly"; then
        echo -e "${GREEN}✅ Home page test passed${NC}"
    else
        echo -e "${RED}❌ Home page test failed${NC}"
        return 1
    fi
    
    cd ..
}

# Main execution
main() {
    echo -e "${BLUE}🎯 Starting automated production setup...${NC}"
    
    # Step 1: Check prerequisites
    check_prerequisites
    
    # Step 2: Get Supabase credentials
    get_supabase_credentials
    
    # Step 3: Set Vercel environment variables
    set_vercel_env_vars
    
    # Step 4: Verify setup
    verify_setup
    
    # Step 5: Redeploy frontend
    redeploy_frontend
    
    # Step 6: Run production tests
    run_production_tests
    
    echo ""
    echo -e "${GREEN}🎉 Production environment setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary:${NC}"
    echo -e "${GREEN}✅ All environment variables configured${NC}"
    echo -e "${GREEN}✅ Supabase connection verified${NC}"
    echo -e "${GREEN}✅ Agent connection verified${NC}"
    echo -e "${GREEN}✅ Frontend redeployed${NC}"
    echo -e "${GREEN}✅ Production tests passed${NC}"
    echo ""
    echo -e "${BLUE}🌐 Your production application is ready:${NC}"
    echo -e "${GREEN}   Frontend: https://chef-chopsky-production.vercel.app${NC}"
    echo -e "${GREEN}   Agent: https://chef-chopsky-production.up.railway.app${NC}"
    echo ""
    echo -e "${BLUE}🔧 To run this setup again:${NC}"
    echo -e "${YELLOW}   ./scripts/setup-production-env.sh${NC}"
}

# Run main function
main "$@"
