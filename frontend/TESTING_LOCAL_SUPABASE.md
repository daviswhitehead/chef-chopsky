# Testing Local Supabase Setup

This guide walks you through testing the local Supabase CLI setup to ensure everything is working correctly.

## Prerequisites

- Docker Desktop installed and running
- Supabase CLI installed (`supabase --version`)
- Node.js 20+ installed

## Step-by-Step Testing

### 1. Test Automated Development Workflow (Recommended)

```bash
# Test the automated workflow - this should just work!
npm run dev:supabase
```

**Expected Output:**
```
🚀 Starting Chef Chopsky development environment with dynamic Supabase...
🔍 Checking Supabase status...
📋 Reading current Supabase credentials...
✅ Supabase running at: http://127.0.0.1:54321
✅ Using dynamic credentials (no .env files needed!)
🎯 Starting frontend and agent services...
🔍 Checking for existing processes on ports 3000 and 3001...
🤖 Starting agent service...
🌐 Starting frontend service...
🎉 Development environment started!
📱 Frontend: http://localhost:3000
🤖 Agent: http://localhost:3001
🗄️ Supabase Studio: http://127.0.0.1:54323
```

**Note**: The script automatically handles port conflicts by killing existing processes on ports 3000 and 3001.

**What this does:**
- Automatically starts Supabase if not running
- Reads current credentials dynamically
- Starts both frontend and agent with correct environment variables
- No manual .env file management needed!

### 2. Test Frontend-Only with Supabase

```bash
# Test just frontend with automatic Supabase credentials
npm run dev:frontend:supabase
```

**Expected Output:**
```
🚀 Starting frontend with dynamic Supabase credentials...
📋 Reading current Supabase credentials...
✅ Using Supabase URL: http://127.0.0.1:54321
✅ Using Publishable Key: sb_publishable_...
✅ Using Secret Key: sb_secret_...
🎯 Starting Next.js frontend...
```

### 3. Test Supabase CLI Installation

```bash
# Check Supabase CLI version
supabase --version
# Should show: 2.48.3 or similar

# Check Docker is running
docker --version
docker ps
# Should show Docker is running without errors
```

### 2. Test Local Supabase Startup

```bash
# Start local Supabase
npm run supabase:start

# Wait for it to complete (may take 2-3 minutes first time)
# Look for: "Started supabase local development setup."
```

**Expected Output:**
- Docker images downloading
- Database initialization
- Migrations applying
- All services starting
- URLs displayed at the end

### 3. Test Supabase Status

```bash
# Check status
npm run supabase:status
```

**Expected Output:**
```
API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1/graphql/v1
Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Publishable key: sb_publishable_...
Secret key: sb_secret_...
```

### 4. Test Credential Extraction

```bash
# Test the credential extraction script
npm run supabase:env:copy
```

**Expected Output:**
```
🔍 Current Local Supabase Credentials:
======================================

📋 Copy these values to your .env.local file:

NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

**Note**: The script automatically changes to the frontend directory where Supabase is configured, so it works from both root and frontend directories.

### 5. Test Database Reset

```bash
# Test database reset
npm run supabase:reset
```

**Expected Output:**
```
Resetting local database...
Recreating database...
Initialising schema...
Applying migration 001_create_conversation_runs.sql...
Applying migration 002_create_conversation_messages.sql...
...
Finished supabase db reset
```

### 6. Test Supabase Studio Access

```bash
# Get the Studio URL from status
npm run supabase:status | grep "Studio URL"

# Open Studio in browser (should show Supabase dashboard)
open http://127.0.0.1:54323
```

**Expected Result:**
- Supabase Studio opens in browser
- Shows local database tables
- Can browse data and run queries

### 7. Test Frontend Integration

```bash
# Create .env.local with current credentials
npm run supabase:env:copy > temp_creds.txt
# Copy the credentials to frontend/.env.local

# Start frontend
npm run dev:frontend

# In another terminal, test API endpoint
curl http://localhost:3000/api/health
```

**Expected Result:**
- Frontend starts without errors
- Health endpoint returns success
- No Supabase connection errors in logs

### 8. Test E2E Tests with Local Supabase

```bash
# Make sure Supabase is running
npm run supabase:status

# Run E2E tests
npm run test:e2e
```

**Expected Result:**
- Tests run against local Supabase
- No mock database warnings
- Real database operations in test logs

### 9. Test Database Operations

```bash
# Connect to local database
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Run some test queries
\dt
SELECT * FROM conversation_runs LIMIT 5;
\q
```

**Expected Result:**
- Can connect to database
- Tables exist (conversation_runs, conversation_messages, etc.)
- Can query data

### 10. Test Stop and Restart

```bash
# Stop Supabase
npm run supabase:stop

# Verify it's stopped
npm run supabase:status
# Should show services are stopped

# Start again
npm run supabase:start

# Verify it's running
npm run supabase:status
# Should show services are running
```

## Troubleshooting Common Issues

### Issue: Docker Not Running
```bash
# Start Docker Desktop
open -a Docker

# Wait for Docker to start, then retry
npm run supabase:start
```

### Issue: Port Conflicts
```bash
# Check what's using ports 54321-54324
lsof -i :54321

# Kill conflicting processes or change ports in supabase/config.toml
```

### Issue: Migration Errors
```bash
# Check migration status
cd frontend && supabase migration list

# Reset and try again
npm run supabase:reset
```

### Issue: Frontend Connection Errors
```bash
# Verify credentials are current
npm run supabase:env:copy

# Update .env.local with current credentials
# Restart frontend
npm run dev:frontend
```

## Success Criteria

✅ **All tests pass if:**
- Supabase starts without errors
- Status shows all services running
- Credential extraction works
- Database reset works
- Studio is accessible
- Frontend connects successfully
- E2E tests run with real database
- Database operations work
- Stop/start cycle works

## Next Steps After Testing

Once everything is working:

1. **Update your workflow**: Use `npm run supabase:start` before development
2. **Update E2E tests**: They now use real database operations
3. **Update documentation**: Share with team members
4. **Set up CI/CD**: Consider using local Supabase in CI for faster tests

## Performance Expectations

- **First startup**: 2-3 minutes (downloading Docker images)
- **Subsequent startups**: 30-60 seconds
- **Database reset**: 10-30 seconds
- **E2E test runs**: Faster than before (no external API calls)

This setup gives you truly "real" database operations in your local development and E2E tests while maintaining fast, reliable performance.
