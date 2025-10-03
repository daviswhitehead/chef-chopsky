# Staging Environment Setup Guide

## Overview
This guide walks through creating a complete staging environment for Chef Chopsky, separate from production but following the same architecture patterns.

## Staging Architecture

### Environment Separation
- **Frontend**: `chef-chopsky-staging` Vercel project
- **Agent**: `chef-chopsky-staging` Railway project  
- **Database**: Separate Supabase staging project
- **Domain**: `https://chef-chopsky-staging.vercel.app`

### Cost Optimization
- Use free tiers where possible
- Memory retriever for staging (no Pinecone costs)
- Shared OpenAI API key with production
- Minimal resource allocation

## Step-by-Step Setup

### 1. Create Staging Vercel Project

#### 1.1 Create New Vercel Project
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import from GitHub repository
4. **Project Name**: `chef-chopsky-staging`
5. **Root Directory**: `frontend/`
6. **Framework Preset**: Next.js (auto-detected)

#### 1.2 Configure Build Settings
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

#### 1.3 Set Environment Variables
In Vercel project settings → Environment Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_staging_publishable_key_here
SUPABASE_SECRET_KEY=your_staging_supabase_secret_key_here

# Agent Service Configuration
AGENT_SERVICE_URL=https://chef-chopsky-staging.up.railway.app

# Environment Configuration
NODE_ENV=staging
NEXT_PUBLIC_APP_ENV=staging
```

### 2. Create Staging Supabase Project

#### 2.1 Create New Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. **Name**: `chef-chopsky-staging`
4. **Database Password**: Generate strong password
5. **Region**: Same as production for consistency
6. **Pricing Plan**: Free tier

#### 2.2 Apply Database Schema
```bash
# Navigate to frontend directory
cd frontend

# Apply migrations to staging
npx supabase db push --project-ref YOUR_STAGING_PROJECT_REF
```

#### 2.3 Get API Keys
1. Go to Project Settings → API
2. Copy:
   - Project URL (for `NEXT_PUBLIC_SUPABASE_URL`)
   - Anon public key (for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
   - Service role key (for `SUPABASE_SECRET_KEY`)

### 3. Create Staging Railway Project

#### 3.1 Create New Railway Project
1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select this repository
5. **Root Directory**: `agent/`
6. **Project Name**: `chef-chopsky-staging`

#### 3.2 Configure Environment Variables
In Railway project settings → Variables:

```bash
# Core Configuration
NODE_ENV=staging
PORT=3001

# OpenAI & LangSmith
OPENAI_API_KEY=your_openai_api_key_here
LANGCHAIN_TRACING=true
LANGCHAIN_PROJECT=chef-chopsky-staging
LANGCHAIN_API_KEY=your_langsmith_api_key_here

# Frontend Integration
FRONTEND_URL=https://chef-chopsky-staging.vercel.app

# Retriever & Embeddings (Cost-optimized for staging)
RETRIEVER_PROVIDER=memory
EMBEDDING_MODEL=openai/text-embedding-3-small
LANGCHAIN_INDEX_NAME=chef-chopsky-staging
APP_ENV=staging
```

#### 3.3 Deploy and Test
1. Railway automatically deploys on git push
2. Test health endpoint: `https://chef-chopsky-staging.up.railway.app/health`
3. Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-02T...",
  "service": "chef-chopsky-staging-agent",
  "version": "1.0.0",
  "environment": "staging"
}
```

### 4. Configure Access Control

#### 4.1 Staging Access Protection
Since staging is for testing, implement basic access control:

**Option A: Password Protection (Recommended)**
- Add simple password check in middleware
- Use environment variable for password
- Easy to share with team members

**Option B: IP Allowlist**
- Restrict access to specific IP addresses
- More secure but less flexible

#### 4.2 Implementation
Create `frontend/middleware.ts`:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply to staging environment
  if (process.env.NODE_ENV !== 'staging') {
    return NextResponse.next()
  }

  // Check for staging password
  const stagingPassword = request.nextUrl.searchParams.get('password')
  const validPassword = process.env.STAGING_PASSWORD || 'chef-chopsky-staging'

  if (stagingPassword !== validPassword) {
    return new NextResponse('Staging Access Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Staging"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
```

### 5. Environment Validation

#### 5.1 Startup Validation
Both frontend and agent should validate environment configuration:

**Frontend Validation** (`frontend/lib/env.ts`):
```typescript
export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'AGENT_SERVICE_URL'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Validate staging-specific requirements
  if (process.env.NODE_ENV === 'staging') {
    if (!process.env.STAGING_PASSWORD) {
      console.warn('⚠️ STAGING_PASSWORD not set, using default')
    }
  }
}
```

**Agent Validation** (`agent/src/config/index.ts`):
```typescript
export function validateEnvironment() {
  const required = ['OPENAI_API_KEY', 'FRONTEND_URL']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Validate staging-specific configuration
  if (process.env.NODE_ENV === 'staging') {
    if (process.env.RETRIEVER_PROVIDER === 'pinecone') {
      console.warn('⚠️ Using Pinecone in staging - consider memory for cost savings')
    }
  }
}
```

### 6. Testing and Validation

#### 6.1 Health Checks
Test all endpoints:
- Frontend: `https://chef-chopsky-staging.vercel.app`
- Agent: `https://chef-chopsky-staging.up.railway.app/health`
- Database: Test connection through frontend

#### 6.2 End-to-End Testing
1. **Authentication**: Test Supabase connection
2. **Chat Flow**: Send test message through frontend
3. **Agent Response**: Verify agent processes and responds
4. **Database**: Check data persistence
5. **CORS**: Verify frontend-agent communication

#### 6.3 Environment Isolation
Verify no cross-environment data bleed:
- Staging data stays in staging
- Production data stays in production
- Different LangSmith projects
- Separate vector stores

## Configuration Files

### Environment Files Created
- `frontend/.env.staging.example` - Staging frontend variables
- `agent/.env.staging.example` - Staging agent variables
- `agent/railway-staging.toml` - Staging Railway config

### URLs and Endpoints
- **Frontend**: `https://chef-chopsky-staging.vercel.app`
- **Agent**: `https://chef-chopsky-staging.up.railway.app`
- **Health Check**: `https://chef-chopsky-staging.up.railway.app/health`
- **Database**: Supabase staging project dashboard

## Cost Management

### Free Tier Usage
- **Vercel**: Free tier (100GB bandwidth, unlimited static)
- **Railway**: Free tier (100GB bandwidth, 1GB RAM)
- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **OpenAI**: Shared with production (pay-per-use)

### Estimated Monthly Cost
- **Staging**: $0-5/month (mostly OpenAI API usage)
- **Production**: $20-30/month (Pinecone + higher usage)

## Maintenance

### Regular Tasks
1. **Monitor Usage**: Check Railway/Supabase usage monthly
2. **Update Dependencies**: Keep staging in sync with production
3. **Test Deployments**: Use staging for testing before production
4. **Clean Data**: Periodically clean test data from staging

### Troubleshooting
- **Deployment Issues**: Check Railway logs
- **Database Issues**: Check Supabase logs
- **CORS Issues**: Verify FRONTEND_URL matches exactly
- **Environment Issues**: Validate all required variables

## Security Considerations

### Staging Security
- **Password Protection**: Basic access control
- **API Keys**: Same keys as production (monitor usage)
- **Database**: Separate from production
- **Logs**: Monitor for sensitive data exposure

### Best Practices
- Never use production data in staging
- Rotate staging passwords regularly
- Monitor API key usage
- Keep staging in sync with production code

---

*This guide ensures a complete staging environment that mirrors production while maintaining cost efficiency and security.*