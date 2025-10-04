# Chef Chopsky Single-Project Environment Setup Guide

## Overview
This guide implements Chef Chopsky's staging environment using Vercel's built-in environment functionality within a single project, eliminating the need for separate staging projects.

## Architecture

### Single Vercel Project: `chef-chopsky`
```
chef-chopsky (Vercel Project)
├── Development (local)
├── Preview (feature branches) → chef-chopsky-git-branch-name.vercel.app
└── Production (main branch) → chef-chopsky-production.vercel.app
```

### Environment Strategy
- **Production**: `main` branch → Production environment
- **Staging**: `staging` branch → Preview environment  
- **Features**: `feature/*` branches → Preview environments
- **Development**: Local development

## Vercel Environment Configuration

### Environment Variables Setup

#### Production Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```bash
# Production Environment (main branch)
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
AGENT_SERVICE_URL=https://chef-chopsky-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://production-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=production_publishable_key
SUPABASE_SECRET_KEY=production_secret_key
```

#### Preview Environment Variables (Staging + Features)
```bash
# Preview Environment (staging branch + feature branches)
NODE_ENV=staging
NEXT_PUBLIC_APP_ENV=staging
AGENT_SERVICE_URL=https://chef-chopsky-staging.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=staging_publishable_key
SUPABASE_SECRET_KEY=staging_secret_key
```

### Environment Detection in Code

#### Frontend Environment Detection (`frontend/lib/env.ts`)
```typescript
export function getEnvironment() {
  // Vercel automatically sets VERCEL_ENV
  const vercelEnv = process.env.VERCEL_ENV; // 'development' | 'preview' | 'production'
  
  // Map Vercel environments to our app environments
  switch (vercelEnv) {
    case 'production':
      return 'production';
    case 'preview':
      return 'staging'; // All preview deployments use staging config
    case 'development':
    default:
      return 'local';
  }
}

export function isProduction() {
  return getEnvironment() === 'production';
}

export function isStaging() {
  return getEnvironment() === 'staging';
}

export function isLocal() {
  return getEnvironment() === 'local';
}
```

#### Agent Environment Detection (`agent/src/config/index.ts`)
```typescript
export function getEnvironment() {
  const nodeEnv = process.env.NODE_ENV;
  const appEnv = process.env.APP_ENV;
  
  // Use APP_ENV if set, otherwise derive from NODE_ENV
  if (appEnv) {
    return appEnv;
  }
  
  switch (nodeEnv) {
    case 'production':
      return 'production';
    case 'staging':
      return 'staging';
    default:
      return 'local';
  }
}
```

## Branch Strategy

### Git Branch Workflow
```bash
# Main branch (Production)
main
├── chef-chopsky-production.vercel.app
└── Uses production environment variables

# Staging branch (Staging)
staging
├── chef-chopsky-git-staging.vercel.app
└── Uses preview environment variables

# Feature branches (Preview)
feature/new-recipe-search
├── chef-chopsky-git-feature-new-recipe-search.vercel.app
└── Uses preview environment variables

feature/user-authentication
├── chef-chopsky-git-feature-user-authentication.vercel.app
└── Uses preview environment variables
```

### Branch Management
```bash
# Create staging branch
git checkout -b staging
git push origin staging

# Create feature branch
git checkout -b feature/new-feature
git push origin feature/new-feature

# Merge feature to staging
git checkout staging
git merge feature/new-feature
git push origin staging

# Merge staging to production
git checkout main
git merge staging
git push origin main
```

## Preview Environment Benefits

### Automatic Feature Testing
- **Every Push**: Creates preview deployment automatically
- **Unique URLs**: Each branch gets its own URL
- **Environment Variables**: Automatically uses preview environment variables
- **Temporary**: Cleaned up after inactivity

### Team Collaboration
- **Share URLs**: Easy to share feature URLs for review
- **No Setup**: Completely automatic
- **Isolation**: Each feature has its own environment
- **Testing**: Test features before merging

### Example Workflow
```bash
# Developer creates feature
git checkout -b feature/recipe-search
# ... make changes ...
git push origin feature/recipe-search

# Vercel automatically creates:
# https://chef-chopsky-git-feature-recipe-search.vercel.app

# Share URL for review
# Test the feature
# Merge when ready
```

## Environment URLs

### Production Environment
- **URL**: `https://chef-chopsky-production.vercel.app`
- **Branch**: `main`
- **Agent**: `https://chef-chopsky-production.up.railway.app`
- **Database**: Production Supabase project

### Staging Environment
- **URL**: `https://chef-chopsky-git-staging.vercel.app`
- **Branch**: `staging`
- **Agent**: `https://chef-chopsky-staging.up.railway.app`
- **Database**: Staging Supabase project

### Feature Environments
- **URL Pattern**: `https://chef-chopsky-git-{branch-name}.vercel.app`
- **Branch**: Any feature branch
- **Agent**: `https://chef-chopsky-staging.up.railway.app` (shared)
- **Database**: Staging Supabase project (shared)

## Setup Instructions

### 1. Configure Vercel Environment Variables

#### Production Environment
1. Go to Vercel dashboard → `chef-chopsky` project
2. Settings → Environment Variables
3. Add variables for **Production** environment:
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_APP_ENV=production
   AGENT_SERVICE_URL=https://chef-chopsky-production.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL=https://production-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=production_publishable_key
   SUPABASE_SECRET_KEY=production_secret_key
   ```

#### Preview Environment
1. Same location, add variables for **Preview** environment:
   ```bash
   NODE_ENV=staging
   NEXT_PUBLIC_APP_ENV=staging
   AGENT_SERVICE_URL=https://chef-chopsky-staging.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=staging_publishable_key
   SUPABASE_SECRET_KEY=staging_secret_key
   ```

### 2. Create Staging Branch
```bash
# Create and push staging branch
git checkout -b staging
git push origin staging

# This automatically creates staging preview deployment
# https://chef-chopsky-git-staging.vercel.app
```

### 3. Test Environment Detection
```bash
# Test production
curl https://chef-chopsky-production.vercel.app/api/env

# Test staging
curl https://chef-chopsky-git-staging.vercel.app/api/env

# Test feature branch
git checkout -b feature/test
git push origin feature/test
curl https://chef-chopsky-git-feature-test.vercel.app/api/env
```

## Environment-Specific Configuration

### Frontend Configuration
```typescript
// frontend/lib/config.ts
export const config = {
  environment: getEnvironment(),
  isProduction: isProduction(),
  isStaging: isStaging(),
  isLocal: isLocal(),
  
  // Environment-specific settings
  apiUrl: isProduction() 
    ? 'https://chef-chopsky-production.up.railway.app'
    : 'https://chef-chopsky-staging.up.railway.app',
    
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};
```

### Agent Configuration
```typescript
// agent/src/config/index.ts
export const config = {
  environment: getEnvironment(),
  isProduction: getEnvironment() === 'production',
  isStaging: getEnvironment() === 'staging',
  
  // Environment-specific settings
  frontendUrl: process.env.FRONTEND_URL,
  retrieverProvider: process.env.RETRIEVER_PROVIDER || 'memory',
  embeddingModel: process.env.EMBEDDING_MODEL || 'openai/text-embedding-3-small',
};
```

## Monitoring and Debugging

### Environment Detection API
Create an API endpoint to check environment:

```typescript
// frontend/app/api/env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    vercelEnv: process.env.VERCEL_ENV,
    nodeEnv: process.env.NODE_ENV,
    appEnv: process.env.NEXT_PUBLIC_APP_ENV,
    agentUrl: process.env.AGENT_SERVICE_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    timestamp: new Date().toISOString(),
  });
}
```

### Debugging Commands
```bash
# Check environment variables
curl https://chef-chopsky-production.vercel.app/api/env
curl https://chef-chopsky-git-staging.vercel.app/api/env

# Check agent environment
curl https://chef-chopsky-production.up.railway.app/health
curl https://chef-chopsky-staging.up.railway.app/health
```

## Benefits of Single-Project Approach

### Simplified Management
- **One Project**: Single Vercel project to manage
- **Unified Dashboard**: All environments in one place
- **Consistent Configuration**: Same project settings across environments

### Cost Efficiency
- **No Additional Projects**: No extra project overhead
- **Shared Resources**: Efficient resource utilization
- **Free Tier Friendly**: Better free tier usage

### Developer Experience
- **Automatic Deployments**: No manual environment setup
- **Branch-Based**: Natural git workflow
- **Instant Testing**: Every feature gets its own URL

### Vercel Best Practices
- **Standard Approach**: How Vercel is designed to work
- **Built-in Features**: Leverages Vercel's native capabilities
- **Future-Proof**: Aligns with Vercel's roadmap

## Migration from Separate Projects

### What Changes
- **No Separate Staging Project**: Use existing `chef-chopsky` project
- **Environment Variables**: Configure per-environment in Vercel
- **Branch Strategy**: Use `staging` branch for staging environment
- **URLs**: Staging becomes `chef-chopsky-git-staging.vercel.app`

### What Stays the Same
- **Railway Projects**: Keep separate Railway projects for agent
- **Supabase Projects**: Keep separate Supabase projects
- **Environment Isolation**: Maintain clear separation
- **Configuration Files**: Same environment variable structure

---

*This approach leverages Vercel's built-in environment functionality for optimal simplicity and cost efficiency.*