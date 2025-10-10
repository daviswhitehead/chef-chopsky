# Local Supabase Setup - Quick Reference

## ✅ What's Been Implemented

### 1. Fixed Production Project Name
- Updated documentation to use `chef-chopsky-production` (not `chef-chopsky`)

### 2. Dynamic Credential Management
- **Problem**: Supabase generates new credentials each time you start it
- **Solution**: Created `scripts/supabase-get-credentials.sh` script
- **Usage**: `npm run supabase:env:copy` to get current credentials

### 3. Complete Testing Guide
- Created `frontend/TESTING_LOCAL_SUPABASE.md` with step-by-step testing instructions

## 🚀 How to Test This Work

### Quick Test (5 minutes)
```bash
# 1. Start Supabase
npm run supabase:start

# 2. Get current credentials
npm run supabase:env:copy

# 3. Copy credentials to .env.local
cp frontend/.env.local.example frontend/.env.local
# Then update with current credentials from step 2

# 4. Test frontend connection
npm run dev:frontend
# Should start without Supabase errors

# 5. Test E2E with real database
npm run test:e2e
# Should use real database operations (not mocks)
```

### Comprehensive Test (15 minutes)
Follow the complete guide in `frontend/TESTING_LOCAL_SUPABASE.md`

## 🔧 Available Commands

```bash
# Supabase Management
npm run supabase:start      # Start local Supabase
npm run supabase:stop       # Stop local Supabase  
npm run supabase:reset      # Reset database
npm run supabase:status     # Check status
npm run supabase:env:copy   # Get current credentials

# From frontend directory
cd frontend
npm run supabase:start      # Same commands, shorter paths
npm run supabase:env:copy   # Get credentials
```

## 📁 Files Created/Updated

### New Files
- `scripts/supabase-get-credentials.sh` - Credential extraction script
- `frontend/SUPABASE_LOCAL_DEVELOPMENT.md` - Complete development guide
- `frontend/TESTING_LOCAL_SUPABASE.md` - Testing instructions

### Updated Files
- `package.json` - Added Supabase scripts
- `frontend/package.json` - Added Supabase scripts
- `frontend/.env.local.example` - Updated with local Supabase URLs
- `frontend/ENVIRONMENT_SETUP.md` - Added reference to new docs
- `docs/projects/v6-deployment-environment-management/tasks.md` - Marked tasks complete

## 🎯 What This Enables

1. **Real Database Operations in E2E Tests**: No more mocks, actual Supabase operations
2. **Fast Development Workflow**: `npm run supabase:reset` gives clean database in seconds
3. **Cost Optimization**: No hosted Supabase costs for local development
4. **Proper Migration Management**: Clear local → staging → production workflow
5. **Environment Isolation**: Local, staging, and production are completely separate

## 🔄 Typical Workflow

```bash
# Start development session
npm run supabase:start
npm run supabase:env:copy  # Copy credentials to .env.local
npm run dev:frontend
npm run dev:agent

# Run tests with real database
npm run test:e2e

# Reset database when needed
npm run supabase:reset

# End development session
npm run supabase:stop
```

## 🚨 Important Notes

- **Credentials change each time**: Always use `npm run supabase:env:copy` after starting
- **Docker must be running**: Start Docker Desktop before `supabase:start`
- **First startup is slow**: 2-3 minutes (downloading images), subsequent starts are fast
- **Environment mapping**: Local CLI → Staging hosted → Production hosted

This setup gives you truly "real" database operations in your local development and E2E tests while maintaining fast, reliable performance!
