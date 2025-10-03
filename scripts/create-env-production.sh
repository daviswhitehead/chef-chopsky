#!/bin/bash

# Create Production Environment File
# This script creates frontend/.env.production from the example file

set -e

echo "📝 Creating Production Environment File"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.production already exists
if [ -f "frontend/.env.production" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env.production already exists${NC}"
    echo -e "${YELLOW}Do you want to overwrite it? (y/N)${NC}"
    read -p "Overwrite? " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Keeping existing file${NC}"
        exit 0
    fi
fi

# Create .env.production from .env.example
echo -e "${BLUE}📄 Creating frontend/.env.production from frontend/.env.example...${NC}"

cp frontend/.env.example frontend/.env.production

# Update the production-specific values
sed -i '' 's|https://your-project-ref.supabase.co|https://wlycgcwsnbhqeojjwjpo.supabase.co|g' frontend/.env.production
sed -i '' 's|your_publishable_key_here|sb_publishable_5Z33oH3ZdsxtVuGGWSwbig_JXW7IXT6|g' frontend/.env.production
sed -i '' 's|http://localhost:3001|https://chef-chopsky-production.up.railway.app|g' frontend/.env.production
sed -i '' 's|NODE_ENV=development|NODE_ENV=production|g' frontend/.env.production
sed -i '' 's|NEXT_PUBLIC_APP_ENV=local|NEXT_PUBLIC_APP_ENV=production|g' frontend/.env.production

echo -e "${GREEN}✅ frontend/.env.production created successfully${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "${YELLOW}1. Edit frontend/.env.production and replace 'your_supabase_secret_key_here' with your actual secret key${NC}"
echo -e "${YELLOW}2. Run: ./scripts/sync-vercel-env.sh --file frontend/.env.production${NC}"
echo -e "${YELLOW}3. Or run: ./scripts/setup-production-env.sh${NC}"
echo ""
echo -e "${BLUE}🔑 To get your secret key:${NC}"
echo -e "${BLUE}   Go to: https://supabase.com/dashboard/project/wlycgcwsnbhqeojjwjpo/settings/api${NC}"
echo -e "${BLUE}   Scroll down to 'Secret keys' section${NC}"
echo -e "${BLUE}   Copy the secret key (starts with 'sb_secret_...')${NC}"
