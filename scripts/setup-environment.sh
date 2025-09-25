#!/bin/bash

# Chef Chopsky Environment Setup Script
# This script helps ensure proper environment configuration

set -e

echo "🔧 Chef Chopsky Environment Setup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 missing${NC}"
        return 1
    fi
}

# Function to check if environment variable is set and not placeholder
check_env_var() {
    local file=$1
    local var=$2
    local placeholder=$3
    
    if [ -f "$file" ]; then
        if grep -q "^${var}=${placeholder}$" "$file" 2>/dev/null; then
            echo -e "${RED}❌ $var is set to placeholder value in $file${NC}"
            return 1
        elif grep -q "^${var}=" "$file" 2>/dev/null; then
            echo -e "${GREEN}✅ $var is configured in $file${NC}"
            return 0
        else
            echo -e "${RED}❌ $var is not set in $file${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ $file does not exist${NC}"
        return 1
    fi
}

echo ""
echo "📋 Checking Frontend Environment..."
echo "-----------------------------------"

# Check frontend .env.local
if ! check_file "frontend/.env.local"; then
    echo -e "${YELLOW}⚠️  Creating frontend/.env.local from example...${NC}"
    cp frontend/.env.example frontend/.env.local
    echo -e "${YELLOW}⚠️  Please edit frontend/.env.local and set your Supabase credentials${NC}"
fi

# Check frontend environment variables
check_env_var "frontend/.env.local" "NEXT_PUBLIC_SUPABASE_URL" "your_supabase_url_here"
check_env_var "frontend/.env.local" "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" "your_supabase_publishable_key_here"

echo ""
echo "🤖 Checking Agent Environment..."
echo "--------------------------------"

# Check agent .env
if ! check_file "agent/.env"; then
    echo -e "${YELLOW}⚠️  Creating agent/.env from example...${NC}"
    cp agent/.env.example agent/.env
    echo -e "${RED}❌ CRITICAL: Please edit agent/.env and set your OpenAI API key${NC}"
    echo -e "${RED}❌ Without this, the agent will run in mock mode with fake responses${NC}"
fi

# Check agent environment variables
check_env_var "agent/.env" "OPENAI_API_KEY" "your_openai_api_key_here"

echo ""
echo "🔍 Environment Summary"
echo "====================="

# Check if we're in mock mode
if [ -f "agent/.env" ]; then
    if grep -q "^OPENAI_API_KEY=your_openai_api_key_here$" "agent/.env" 2>/dev/null; then
        echo -e "${RED}❌ Agent will run in MOCK MODE (fake responses)${NC}"
        echo -e "${RED}❌ Set OPENAI_API_KEY in agent/.env to get real AI responses${NC}"
    else
        echo -e "${GREEN}✅ Agent configured for real AI responses${NC}"
    fi
else
    echo -e "${RED}❌ Agent/.env file missing - will run in MOCK MODE${NC}"
fi

echo ""
echo "📚 Next Steps"
echo "============="

if [ -f "agent/.env" ] && grep -q "^OPENAI_API_KEY=your_openai_api_key_here$" "agent/.env" 2>/dev/null; then
    echo -e "${YELLOW}1. Edit agent/.env and replace 'your_openai_api_key_here' with your real OpenAI API key${NC}"
    echo -e "${YELLOW}2. Edit frontend/.env.local and set your Supabase credentials${NC}"
    echo -e "${YELLOW}3. Restart both services: npm run dev${NC}"
else
    echo -e "${GREEN}✅ Environment appears to be configured correctly${NC}"
    echo -e "${GREEN}✅ You can start the services with: npm run dev${NC}"
fi

echo ""
echo "🚀 To start the services:"
echo "   npm run dev"
echo ""
echo "🔧 To check service health:"
echo "   npm run health:check"
echo ""
echo "📖 For more help, see README.md"