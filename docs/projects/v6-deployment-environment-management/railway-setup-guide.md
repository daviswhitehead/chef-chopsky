# Railway Setup Guide for Agent Service

## Overview
Railway deployment for the Chef Chopsky agent service provides reliable Node.js hosting with automatic CI/CD from GitHub.

## Prerequisites
- GitHub account with this repository
- Railway account (free tier available)
- Production environment variables ready

## Step-by-Step Setup

### 1. Create Railway Account & Project
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended for seamless integration)
3. Click "Start a New Project"
4. Choose "Deploy from GitHub repo"
5. Select this repository
6. Choose **only the `agent/` folder** (not the entire repo)

### 2. Configure Railway Deployment
1. In Railway dashboard, select your new project
2. Go to Settings → Source → Change Root Directory
3. Set root directory to: `agent/`
4. Railway will auto-detect Node.js and create Dockerfile

### 3. Set Production Environment Variables
In Railway project settings → Variables, add:

```bash
# Core Configuration
NODE_ENV=production
PORT=3001

# OpenAI & LangSmith
OPENAI_API_KEY=your_openai_api_key_here
LANGCHAIN_TRACING=true
LANGCHAIN_PROJECT=chef-chopsky-production
LANGCHAIN_API_KEY=your_langsmith_api_key_here

# Frontend Integration
FRONTEND_URL=https://your-frontend.vercel.app

# Retriever & Embeddings
RETRIEVER_PROVIDER=pinecone
EMBEDDING_MODEL=openai/text-embedding-3-small
LANGCHAIN_INDEX_NAME=chef-chopsky-production
APP_ENV=production
```

### 4. Deploy and Test
1. Railway automatically detects pushes to main branch
2. Monitor deployment logs in Railway dashboard
3. Test auth endpoint: `https://{project-name}.up.railway.app/health`
4. Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-02T...",
  "service": "chef-chopsky-agent",
  "version": "1.0.0"
}
```

### 5. Update Frontend Configuration
In your Vercel frontend environment:

```bash
# Replace placeholder with actual Railway URL
AGENT_SERVICE_URL=https://your-project-name.up.railway.app
```

## Railway-Specific Benefits

### Config as Code
- **Version Control**: Configuration stored in `railway.toml` alongside your code
- **Reproducibility**: Consistent deployments across environments
- **Environment-Specific**: Different configs for staging/production
- **Collaboration**: Team members can see and modify deployment settings

### Automatic Scaling
- Automatic spin-up during traffic spikes
- Scales to zero during idle periods
- Free tier: 100GB bandwidth, 1GB RAM

### Built-in CI/CD
- Automatic deployment on git push to main
- Preview deployments on feature branches (if enabled)
- Rollback capability from dashboard

### Environment Management
- Environment variables managed in Railway dashboard
- Secrets encrypted at rest
- Easy switching between staging/production

## Troubleshooting

### Common Issues
1. **Deployment fails**: Check Railway logs for dependency mismatches
2. **Health check fails**: Verify PORT=3001 is set correctly
3. **CORS errors**: Ensure FRONTEND_URL matches your Vercel URL exactly
4. **TypeScript module errors**: Ensure `railway.toml` and `start` script are configured (see troubleshooting below)

### TypeScript Build Issues
If you see `ERR_MODULE_NOT_FOUND` errors for `.ts` files:

1. **Ensure `railway.toml` exists** in the `agent/` directory:
   ```toml
   [build]
   builder = "NIXPACKS"

   [deploy]
   startCommand = "npm run build && node dist/server.js"
   healthcheckPath = "/health"
   ```

2. **Ensure `package.json` has a `start` script**:
   ```json
   "scripts": {
     "start": "node dist/server.js",
     "build": "tsc"
   }
   ```

3. **Redeploy**: Railway will automatically rebuild when you push changes

### Monitoring
- Railway dashboard shows deployment status
- Built-in logs viewer for debugging
- Uptime monitoring available in Railway metrics

## Cost Management

### Free Tier Limits
- 100GB bandwidth per month
- 1GB RAM
- Sleep after 5 minutes of inactivity (auto-wake on request)

### Upgrade Path
- Starter plan: $5/month for always-on
- Pro plan: $20/month for production scaling

## Deployment Scripts

### Environment Variable Sync
```bash
# Sync .env.production to Railway (batch operation)
npm run sync:env
```

### Config as Code Deployment
```bash
# Deploy using Railway config as code
npm run deploy:railway production
npm run deploy:railway staging
```

### Manual Deployment
```bash
# Traditional Railway deployment
railway up
```

## Configuration Files

### railway.toml
The main Railway configuration file defines:
- Build commands and process
- Health check settings
- Restart policies
- Environment-specific overrides
- Service metadata

### railway-env-template.md
Template for environment variables with:
- Required vs optional variables
- Environment-specific values
- Security notes
- Setup instructions

---

*This guide assumes Railway account creation and GitHub integration. For enterprise or team setups, refer to Railway's documentation.*
