# Git Branch Strategy for Chef Chopsky

## Overview
This document defines the git branch strategy for Chef Chopsky using Vercel's single-project environment approach with automatic preview deployments.

## Branch Structure

### Main Branches
```
main (Production)
├── chef-chopsky-production.vercel.app
├── Production environment variables
└── Production Supabase + Railway

staging (Staging)
├── chef-chopsky-git-staging.vercel.app
├── Preview environment variables
└── Staging Supabase + Railway
```

### Feature Branches
```
feature/new-recipe-search
├── chef-chopsky-git-feature-new-recipe-search.vercel.app
├── Preview environment variables
└── Staging Supabase + Railway (shared)

feature/user-authentication
├── chef-chopsky-git-feature-user-authentication.vercel.app
├── Preview environment variables
└── Staging Supabase + Railway (shared)
```

## Environment Mapping

### Vercel Environment Detection
Vercel automatically sets `VERCEL_ENV` based on branch:

| Branch Type | VERCEL_ENV | URL Pattern | Environment Variables |
|-------------|------------|-------------|----------------------|
| `main` | `production` | `chef-chopsky-production.vercel.app` | Production |
| `staging` | `preview` | `chef-chopsky-git-staging.vercel.app` | Preview |
| `feature/*` | `preview` | `chef-chopsky-git-{branch-name}.vercel.app` | Preview |

### Environment Variables Configuration

#### Production Environment (main branch)
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
AGENT_SERVICE_URL=https://chef-chopsky-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://production-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=production_publishable_key
SUPABASE_SECRET_KEY=production_secret_key
```

#### Preview Environment (staging + feature branches)
```bash
NODE_ENV=staging
NEXT_PUBLIC_APP_ENV=staging
AGENT_SERVICE_URL=https://chef-chopsky-staging.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=staging_publishable_key
SUPABASE_SECRET_KEY=staging_secret_key
```

## Workflow Examples

### Feature Development Workflow
```bash
# 1. Create feature branch from staging
git checkout staging
git pull origin staging
git checkout -b feature/new-recipe-search

# 2. Make changes and push
git add .
git commit -m "feat: add new recipe search functionality"
git push origin feature/new-recipe-search

# 3. Automatic preview deployment created:
# https://chef-chopsky-git-feature-new-recipe-search.vercel.app

# 4. Test and iterate
# Make more changes, push updates
git add .
git commit -m "fix: improve search performance"
git push origin feature/new-recipe-search

# 5. Merge to staging when ready
git checkout staging
git merge feature/new-recipe-search
git push origin staging

# 6. Staging deployment updated:
# https://chef-chopsky-git-staging.vercel.app
```

### Staging to Production Workflow
```bash
# 1. Test staging thoroughly
# Visit: https://chef-chopsky-git-staging.vercel.app

# 2. Merge staging to production
git checkout main
git pull origin main
git merge staging
git push origin main

# 3. Production deployment updated:
# https://chef-chopsky-production.vercel.app
```

### Hotfix Workflow
```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug-fix

# 2. Make fix and push
git add .
git commit -m "fix: resolve critical authentication bug"
git push origin hotfix/critical-bug-fix

# 3. Test hotfix in preview:
# https://chef-chopsky-git-hotfix-critical-bug-fix.vercel.app

# 4. Merge directly to main (skip staging for urgent fixes)
git checkout main
git merge hotfix/critical-bug-fix
git push origin main

# 5. Also merge to staging to keep it up to date
git checkout staging
git merge hotfix/critical-bug-fix
git push origin staging
```

## Branch Naming Conventions

### Feature Branches
```bash
feature/description
feature/user-authentication
feature/recipe-search
feature/mobile-responsive
```

### Bug Fix Branches
```bash
fix/description
fix/login-error
fix/search-performance
fix/mobile-layout
```

### Hotfix Branches
```bash
hotfix/description
hotfix/critical-security-issue
hotfix/payment-processing-bug
```

### Release Branches
```bash
release/version
release/v1.2.0
release/v2.0.0
```

## Environment-Specific Code

### Frontend Environment Detection
```typescript
// frontend/lib/env.ts
export function getEnvironment() {
  const vercelEnv = process.env.VERCEL_ENV;
  
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

### Agent Environment Detection
```typescript
// agent/src/config/index.ts
export function getEnvironment() {
  const nodeEnv = process.env.NODE_ENV;
  const appEnv = process.env.APP_ENV;
  
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

### Example URLs
```bash
# Staging
https://chef-chopsky-git-staging.vercel.app

# Features
https://chef-chopsky-git-feature-new-recipe-search.vercel.app
https://chef-chopsky-git-feature-user-authentication.vercel.app
https://chef-chopsky-git-fix-login-error.vercel.app

# Hotfixes
https://chef-chopsky-git-hotfix-critical-bug-fix.vercel.app
```

## Branch Protection Rules

### Main Branch Protection
- **Require PR**: All changes must go through pull requests
- **Require Reviews**: At least one approval required
- **Require Status Checks**: All CI checks must pass
- **Require Up-to-Date**: Branch must be up to date before merging

### Staging Branch Protection
- **Require PR**: Changes from feature branches must go through PRs
- **Allow Direct Pushes**: From main branch (for hotfixes)
- **Require Status Checks**: Basic CI checks must pass

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Deploy
on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

### Environment-Specific Deployments
- **Production**: Automatic deployment from `main` branch
- **Staging**: Automatic deployment from `staging` branch
- **Preview**: Automatic deployment from any feature branch

## Monitoring and Debugging

### Environment Detection API
```typescript
// frontend/app/api/env/route.ts
export async function GET() {
  return NextResponse.json({
    vercelEnv: process.env.VERCEL_ENV,
    nodeEnv: process.env.NODE_ENV,
    appEnv: process.env.NEXT_PUBLIC_APP_ENV,
    branch: process.env.VERCEL_GIT_COMMIT_REF,
    url: process.env.VERCEL_URL,
    timestamp: new Date().toISOString(),
  });
}
```

### Debugging Commands
```bash
# Check environment info
curl https://chef-chopsky-production.vercel.app/api/env
curl https://chef-chopsky-git-staging.vercel.app/api/env
curl https://chef-chopsky-git-feature-test.vercel.app/api/env

# Check agent environment
curl https://chef-chopsky-production.up.railway.app/health
curl https://chef-chopsky-staging.up.railway.app/health
```

## Best Practices

### Branch Management
- **Keep Branches Short-Lived**: Merge quickly to avoid conflicts
- **Use Descriptive Names**: Clear branch names for easy identification
- **Clean Up**: Delete merged branches regularly
- **Sync Often**: Keep branches up to date with main/staging

### Environment Testing
- **Test Locally**: Use local environment for development
- **Test Preview**: Use preview deployments for feature testing
- **Test Staging**: Use staging for integration testing
- **Test Production**: Use production for final validation

### Deployment Strategy
- **Feature Branches**: Automatic preview deployments
- **Staging Branch**: Manual testing and integration
- **Main Branch**: Production deployment with approval
- **Hotfixes**: Direct to main with immediate staging sync

---

*This branch strategy leverages Vercel's built-in environment functionality for optimal development workflow.*