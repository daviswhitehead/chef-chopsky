# CI Supabase Configuration

## Overview

The CI workflow uses **local Supabase CLI** (Docker-based) instead of requiring separate hosted Supabase projects for testing.

## Architecture

- **CI Tests**: Local Supabase CLI → `http://127.0.0.1:54321` (Docker containers)
- **Staging Tests**: Hosted Supabase → `chef-chopsky-staging` project
- **Production**: Hosted Supabase → `chef-chopsky-production` project

## Required GitHub Secrets

### For CI (Local Supabase CLI)
- `SUPABASE_LOCAL_PUBLISHABLE_KEY`: Local Supabase publishable key
- `SUPABASE_LOCAL_SECRET_KEY`: Local Supabase secret key

### For Staging Tests
- `STAGING_SUPABASE_URL`: Staging project URL
- `STAGING_SUPABASE_PUBLISHABLE_KEY`: Staging publishable key
- `STAGING_SUPABASE_SECRET_KEY`: Staging secret key

## How to Get Local Supabase Credentials

### Option 1: From Local Development
```bash
# Start local Supabase
npm run supabase:start

# Get current credentials
npm run supabase:env:copy

# Copy the publishable and secret keys to GitHub secrets
```

### Option 2: From CI Logs
The CI will show the credentials when starting Supabase. You can extract them from the logs.

## Benefits

✅ **No Additional Supabase Projects**: Uses Docker containers  
✅ **Cost Effective**: No hosted Supabase costs for CI  
✅ **Fast & Reliable**: Local database starts in seconds  
✅ **Isolated**: Each CI run gets a fresh database  
✅ **Consistent**: Same setup as local development  

## CI Workflow

1. **Install Supabase CLI**: `npm install -g supabase@latest`
2. **Start Local Supabase**: `cd frontend && supabase start`
3. **Run Tests**: Integration and E2E tests use real database
4. **Cleanup**: `cd frontend && supabase stop`

## Environment Variables

```yaml
# CI uses local Supabase CLI
NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.SUPABASE_LOCAL_PUBLISHABLE_KEY }}
SUPABASE_SECRET_KEY: ${{ secrets.SUPABASE_LOCAL_SECRET_KEY }}
```

## Migration Strategy

- **Local Development**: Supabase CLI with migrations
- **CI Testing**: Same Supabase CLI setup
- **Staging Deployment**: Migrations applied to hosted staging
- **Production Deployment**: Migrations applied to hosted production

This ensures all environments use the same database schema and migrations.
