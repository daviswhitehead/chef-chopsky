# Supabase Local Development & Migration Guide

This guide covers how to use Supabase CLI for local development, including database management and migration workflows.

## Prerequisites

- Docker Desktop installed and running
- Supabase CLI installed (`supabase --version` should work)
- Node.js and npm installed

## Local Supabase Setup

### Starting Local Supabase

```bash
# Start local Supabase (includes database, API, Studio, etc.)
npm run supabase:start

# Or from frontend directory
cd frontend && supabase start
```

This will:
- Download and start Docker containers for all Supabase services
- Apply all migrations from `frontend/supabase/migrations/`
- Provide local URLs for development

### Local Supabase URLs

After starting, you'll have access to:
- **API URL**: `http://127.0.0.1:54321`
- **Database URL**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **Studio URL**: `http://127.0.0.1:54323` (Supabase Dashboard)
- **GraphQL URL**: `http://127.0.0.1:54321/graphql/v1`

### Environment Variables for Local Development

**Important**: Local Supabase generates new credentials each time you start it. You need to update your `.env.local` file with the current credentials.

#### Option 1: Automatic Credential Extraction
```bash
# Get current credentials and copy them
npm run supabase:env:copy

# This will display the current credentials that you can copy to .env.local
```

#### Option 2: Manual Extraction
```bash
# Check current credentials
npm run supabase:status

# Copy the values to your .env.local file:
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
# SUPABASE_SECRET_KEY=sb_secret_...
```

#### Option 3: Use the Example File
```bash
# Copy the example file (has placeholder values)
cp .env.local.example .env.local

# Then update with current credentials using Option 1 or 2 above
```

## Database Migration Workflow

### Local Development Workflow

#### 1. Reset Local Database
```bash
# Reset local database and apply all migrations
npm run supabase:reset

# Or from frontend directory
cd frontend && supabase db reset
```

This command:
- Drops and recreates the local database
- Applies all migrations in order
- Seeds the database with initial data
- Restarts all containers

#### 2. Create New Migration
```bash
# Create a new migration file
cd frontend && supabase migration new "your_migration_name"

# This creates a file like: supabase/migrations/20240101120000_your_migration_name.sql
```

#### 3. Apply Migration Locally
```bash
# Apply the new migration
cd frontend && supabase db reset

# Or apply just the new migration
cd frontend && supabase db push
```

### Staging/Production Deployment Workflow

#### 1. Push Migrations to Staging
```bash
# Link to staging project
cd frontend && supabase link --project-ref YOUR_STAGING_PROJECT_REF

# Push migrations to staging
cd frontend && supabase db push
```

#### 2. Push Migrations to Production
```bash
# Link to production project
cd frontend && supabase link --project-ref YOUR_PRODUCTION_PROJECT_REF

# Push migrations to production
cd frontend && supabase db push
```

## Available NPM Scripts

### Root Package Scripts
```bash
npm run supabase:start    # Start local Supabase
npm run supabase:stop     # Stop local Supabase
npm run supabase:reset    # Reset local database
npm run supabase:status   # Check Supabase status
```

### Frontend Package Scripts
```bash
npm run supabase:start    # Start local Supabase
npm run supabase:stop     # Stop local Supabase
npm run supabase:reset    # Reset local database
npm run supabase:status   # Check Supabase status
```

## Migration Files

Current migrations in `frontend/supabase/migrations/`:

1. **001_create_conversation_runs.sql** - Main conversation tracking table
2. **002_create_conversation_messages.sql** - Individual messages within conversations
3. **003_create_conversation_analytics.sql** - Analytics and metrics tables
4. **004_setup_rls_policies.sql** - Row Level Security policies
5. **005_create_frontend_tables.sql** - Frontend-specific tables (conversations, messages, feedback)
6. **006_migrate_frontend_to_new_tables.sql** - Data migration from old to new schema

## Best Practices

### Development Workflow
1. **Always test migrations locally first** using `supabase db reset`
2. **Create descriptive migration names** that explain what they do
3. **Test both up and down migrations** when possible
4. **Use transactions** for complex migrations
5. **Backup production data** before applying migrations

### Migration Naming Convention
- Use descriptive names: `add_user_preferences_table`
- Include date prefix: `20240101120000_add_user_preferences_table`
- Use snake_case for consistency

### Environment Management
- **Local**: Use `supabase db reset` for clean slate testing
- **Staging**: Use `supabase db push` to apply new migrations
- **Production**: Use `supabase db push` with careful review

## Troubleshooting

### Common Issues

#### Docker Not Running
```bash
# Start Docker Desktop
open -a Docker

# Wait for Docker to start, then try again
npm run supabase:start
```

#### Port Conflicts
If ports 54321-54324 are in use:
```bash
# Check what's using the ports
lsof -i :54321

# Stop conflicting services or change ports in supabase/config.toml
```

#### Migration Errors
```bash
# Check migration status
cd frontend && supabase migration list

# Reset and try again
npm run supabase:reset
```

#### Database Connection Issues
```bash
# Check Supabase status
npm run supabase:status

# Restart if needed
npm run supabase:stop
npm run supabase:start
```

## Environment-Specific Notes

### Local Development
- Uses Docker containers for all services
- Database resets are safe and fast
- All data is ephemeral (lost on reset)
- Perfect for testing and development

### Staging Environment
- Uses hosted Supabase project: `chef-chopsky-staging`
- Migrations are persistent
- Test migrations here before production
- Environment variables point to staging URLs

### Production Environment
- Uses hosted Supabase project: `chef-chopsky-production`
- Migrations are permanent
- Always backup before applying migrations
- Environment variables point to production URLs

## Integration with E2E Tests

Local Supabase is perfect for E2E tests because:
- **Real database operations** (not mocks)
- **Fast reset** between test runs
- **Consistent state** for each test
- **No external dependencies** or API limits

### E2E Test Workflow
```bash
# Start services for E2E tests
npm run supabase:start
npm run dev:frontend
npm run dev:agent

# Run E2E tests
npm run test:e2e

# Reset database between test runs if needed
npm run supabase:reset
```

This gives you truly "real" database operations in your E2E tests while maintaining fast, reliable test execution.
