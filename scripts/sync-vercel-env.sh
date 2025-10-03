#!/bin/bash

# Vercel Environment Variables Sync Script
# Automatically syncs environment variables from local files to Vercel

set -e

echo "🔄 Vercel Environment Variables Sync"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI is not installed${NC}"
        echo -e "${YELLOW}Install it with: npm install -g vercel${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Vercel CLI is installed${NC}"
}

# Function to check if user is logged in to Vercel
check_vercel_auth() {
    if ! vercel whoami &> /dev/null; then
        echo -e "${RED}❌ Not logged in to Vercel${NC}"
        echo -e "${YELLOW}Please run: vercel login${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Logged in to Vercel${NC}"
}

# Function to sync environment variable
sync_env_var() {
    local var_name=$1
    local var_value=$2
    local environment=${3:-production}
    
    echo -e "${BLUE}🔄 Syncing ${var_name} to ${environment}...${NC}"
    
    # Check if variable already exists
    if vercel env ls | grep -q "${var_name}"; then
        echo -e "${YELLOW}⚠️  ${var_name} already exists, updating...${NC}"
        vercel env rm "${var_name}" "${environment}" --yes
    fi
    
    # Add the variable
    echo "${var_value}" | vercel env add "${var_name}" "${environment}"
    echo -e "${GREEN}✅ ${var_name} synced successfully${NC}"
}

# Function to sync from .env file
sync_from_env_file() {
    local env_file=$1
    local environment=${2:-production}
    
    if [ ! -f "$env_file" ]; then
        echo -e "${RED}❌ Environment file not found: ${env_file}${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📄 Syncing from ${env_file} to ${environment}...${NC}"
    
    # Source the environment file to get variables
    set -a  # automatically export all variables
    source "$env_file"
    set +a  # stop automatically exporting
    
    # Define which variables to sync
    local variables_to_sync=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
        "SUPABASE_SECRET_KEY"
        "AGENT_SERVICE_URL"
        "NODE_ENV"
        "NEXT_PUBLIC_APP_ENV"
    )
    
    # Sync each variable
    for var_name in "${variables_to_sync[@]}"; do
        local var_value="${!var_name}"
        
        if [ -z "$var_value" ]; then
            echo -e "${YELLOW}⚠️  ${var_name} not set in ${env_file}${NC}"
            continue
        fi
        
        # Skip placeholder values
        if [[ $var_value =~ ^your_.*_here$ ]] || [[ $var_value =~ ^.*_placeholder.*$ ]]; then
            echo -e "${YELLOW}⚠️  Skipping placeholder value for ${var_name}${NC}"
            continue
        fi
        
        sync_env_var "$var_name" "$var_value" "$environment"
    done
}

# Function to get Supabase service role key
get_supabase_service_key() {
    local project_ref=$1
    
    if [ -z "$project_ref" ]; then
        echo -e "${RED}❌ Supabase project reference is required${NC}"
        echo -e "${YELLOW}Usage: get_supabase_service_key <project-ref>${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔑 Getting Supabase service role key for project: ${project_ref}${NC}"
    echo -e "${YELLOW}⚠️  This requires manual input from Supabase dashboard${NC}"
    echo -e "${YELLOW}1. Go to: https://supabase.com/dashboard/project/${project_ref}/settings/api${NC}"
    echo -e "${YELLOW}2. Copy the 'service_role' key (starts with 'eyJ...')${NC}"
    echo -e "${YELLOW}3. Paste it below:${NC}"
    
    read -p "Service Role Key: " service_key
    
    if [ -z "$service_key" ]; then
        echo -e "${RED}❌ No service role key provided${NC}"
        return 1
    fi
    
    # Validate key format (should start with 'eyJ')
    if [[ ! $service_key =~ ^eyJ ]]; then
        echo -e "${RED}❌ Invalid service role key format${NC}"
        echo -e "${YELLOW}Service role key should start with 'eyJ...'${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Service role key validated${NC}"
    echo "$service_key"
}

# Main function
main() {
    echo -e "${BLUE}🚀 Starting Vercel environment sync...${NC}"
    
    # Check prerequisites
    check_vercel_cli
    check_vercel_auth
    
    # Parse command line arguments
    local env_file=""
    local environment="production"
    local project_ref=""
    local sync_service_key=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --file|-f)
                env_file="$2"
                shift 2
                ;;
            --environment|-e)
                environment="$2"
                shift 2
                ;;
            --project-ref|-p)
                project_ref="$2"
                shift 2
                ;;
            --sync-service-key|-s)
                sync_service_key=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  -f, --file FILE           Environment file to sync from"
                echo "  -e, --environment ENV     Vercel environment (default: production)"
                echo "  -p, --project-ref REF     Supabase project reference"
                echo "  -s, --sync-service-key    Sync Supabase service role key"
                echo "  -h, --help               Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0 --file frontend/.env.production"
                echo "  $0 --sync-service-key --project-ref wlycgcwsnbhqeojjwjpo"
                echo "  $0 --file frontend/.env.production --environment staging"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Unknown option: $1${NC}"
                exit 1
                ;;
        esac
    done
    
    # Sync from environment file if provided
    if [ -n "$env_file" ]; then
        sync_from_env_file "$env_file" "$environment"
    fi
    
    # Sync service role key if requested
    if [ "$sync_service_key" = true ]; then
        if [ -z "$project_ref" ]; then
            echo -e "${RED}❌ Project reference is required for service key sync${NC}"
            echo -e "${YELLOW}Use: --project-ref <your-project-ref>${NC}"
            exit 1
        fi
        
        local service_key
        service_key=$(get_supabase_service_key "$project_ref")
        
        if [ $? -eq 0 ]; then
            sync_env_var "SUPABASE_SERVICE_ROLE_KEY" "$service_key" "$environment"
        else
            echo -e "${RED}❌ Failed to get service role key${NC}"
            exit 1
        fi
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Environment sync completed!${NC}"
    echo ""
    echo -e "${BLUE}📋 Current Vercel environment variables:${NC}"
    vercel env ls
}

# Run main function with all arguments
main "$@"
