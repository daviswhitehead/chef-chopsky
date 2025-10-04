# Chef Chopsky Staging Environment Status

## Overview
This document tracks the current status of the Chef Chopsky staging environment setup and provides quick reference for URLs, configuration, and maintenance.

## Environment URLs

### Single Vercel Project: `chef-chopsky`

#### Production Environment
- **Frontend**: `https://chef-chopsky-production.vercel.app`
- **Branch**: `main`
- **Agent**: `https://chef-chopsky-production.up.railway.app`
- **Health Check**: `https://chef-chopsky-production.up.railway.app/health`

#### Staging Environment (Preview)
- **Frontend**: `https://chef-chopsky-git-staging.vercel.app`
- **Branch**: `staging`
- **Agent**: `https://chef-chopsky-staging.up.railway.app`
- **Health Check**: `https://chef-chopsky-staging.up.railway.app/health`

#### Feature Environments (Preview)
- **URL Pattern**: `https://chef-chopsky-git-{branch-name}.vercel.app`
- **Branches**: Any feature branch (e.g., `feature/new-recipe-search`)
- **Agent**: `https://chef-chopsky-staging.up.railway.app` (shared)
- **Health Check**: `https://chef-chopsky-staging.up.railway.app/health`

## Configuration Files Created

### Environment Templates
- `frontend/.env.staging.example` - Staging frontend environment variables
- `agent/.env.staging.example` - Staging agent environment variables
- `agent/railway-staging.toml` - Staging Railway configuration

### Setup Scripts
- `scripts/setup-staging-environment.sh` - Automated staging setup
- `scripts/validate-staging-environment.sh` - Environment validation

### Documentation
- `docs/projects/v6-deployment-environment-management/staging-setup-guide.md` - Complete setup guide
- `docs/projects/v6-deployment-environment-management/staging-environment-status.md` - This file

## Environment Variables

### Frontend Staging Variables
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

### Agent Staging Variables
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

# Retriever & Embeddings (Cost-optimized)
RETRIEVER_PROVIDER=memory
EMBEDDING_MODEL=openai/text-embedding-3-small
LANGCHAIN_INDEX_NAME=chef-chopsky-staging
APP_ENV=staging
```

## Setup Status

### ✅ Completed
- [x] Staging environment configuration files created
- [x] Setup scripts and validation tools created
- [x] Comprehensive documentation written
- [x] Environment variable templates prepared
- [x] Railway staging configuration created

### 🔄 Manual Setup Required
- [ ] Create Vercel staging project (`chef-chopsky-staging`)
- [ ] Create Supabase staging project (`chef-chopsky-staging`)
- [ ] Create Railway staging project (`chef-chopsky-staging`)
- [ ] Configure environment variables in all platforms
- [ ] Apply database schema to staging Supabase
- [ ] Test end-to-end functionality

### 📋 Next Steps
1. **Run Setup Script**: `./scripts/setup-staging-environment.sh`
2. **Follow Manual Setup**: Complete Vercel, Supabase, and Railway project creation
3. **Validate Environment**: `./scripts/validate-staging-environment.sh`
4. **Test Functionality**: End-to-end testing of chat flow

## Cost Optimization

### Staging Environment Costs
- **Vercel**: Free tier (100GB bandwidth, unlimited static)
- **Railway**: Free tier (100GB bandwidth, 1GB RAM)
- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **OpenAI**: Shared with production (pay-per-use)

### Estimated Monthly Cost
- **Staging**: $0-5/month (mostly OpenAI API usage)
- **Production**: $20-30/month (Pinecone + higher usage)

## Environment Isolation

### Data Separation
- **Database**: Separate Supabase projects
- **Vector Store**: Different index names (`chef-chopsky-staging` vs `chef-chopsky-production`)
- **LangSmith**: Separate projects for tracing
- **Logs**: Separate logging streams

### Security Considerations
- **Access Control**: Password protection for staging
- **API Keys**: Same keys as production (monitor usage)
- **Environment Variables**: Separate configuration per environment

## Monitoring and Maintenance

### Health Checks
- **Frontend**: HTTP 200 response from staging URL
- **Agent**: `/health` endpoint returns `{"status":"ok","environment":"staging"}`
- **Database**: Connection test through frontend

### Regular Tasks
- **Monitor Usage**: Check Railway/Supabase usage monthly
- **Update Dependencies**: Keep staging in sync with production
- **Test Deployments**: Use staging for testing before production
- **Clean Data**: Periodically clean test data from staging

### Troubleshooting
- **Deployment Issues**: Check Railway logs
- **Database Issues**: Check Supabase logs
- **CORS Issues**: Verify FRONTEND_URL matches exactly
- **Environment Issues**: Validate all required variables

## Quick Commands

### Setup Staging Environment
```bash
# Run the setup script
./scripts/setup-staging-environment.sh

# Validate the environment
./scripts/validate-staging-environment.sh
```

### Test Staging Endpoints
```bash
# Test frontend
curl -I https://chef-chopsky-staging.vercel.app

# Test agent health
curl https://chef-chopsky-staging.up.railway.app/health
```

### Environment Validation
```bash
# Check environment files
ls -la frontend/.env.staging*
ls -la agent/.env.staging*

# Validate configuration
grep -E "^(NODE_ENV|FRONTEND_URL|AGENT_SERVICE_URL)=" frontend/.env.staging
grep -E "^(NODE_ENV|FRONTEND_URL|RETRIEVER_PROVIDER)=" agent/.env.staging
```

## Security Notes

### Staging Security
- **Password Protection**: Basic access control implemented
- **API Keys**: Same keys as production (monitor usage)
- **Database**: Separate from production
- **Logs**: Monitor for sensitive data exposure

### Best Practices
- Never use production data in staging
- Rotate staging passwords regularly
- Monitor API key usage
- Keep staging in sync with production code

## Support and Documentation

### Related Documentation
- [Staging Setup Guide](./staging-setup-guide.md) - Complete setup instructions
- [Railway Setup Guide](./railway-setup-guide.md) - Railway-specific configuration
- [Tasks Overview](./tasks.md) - Project task tracking

### Getting Help
- Check the setup guide for detailed instructions
- Run validation scripts to diagnose issues
- Review environment variable configuration
- Check platform-specific logs (Railway, Vercel, Supabase)

---

*Last updated: January 2025*
*Environment: Staging*
*Status: Configuration Complete, Manual Setup Required*