# Staging Deployment Secrets Configuration

## Overview
This document outlines all the required GitHub secrets for automated staging deployment on feature branches and the staging branch.

## Required GitHub Secrets

### 🔐 Vercel Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel authentication token | 1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)<br>2. Click "Create Token"<br>3. Name: "GitHub Actions Staging"<br>4. Copy the token |
| `VERCEL_PROJECT_ID` | Vercel project ID for staging | 1. Go to your Vercel project settings<br>2. Copy the Project ID from the General tab<br>3. **Note**: Same project as production, uses preview environment |

### 🚂 Railway Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `RAILWAY_STAGING_TOKEN` | Railway authentication token for staging | 1. Go to [railway.app/account/tokens](https://railway.app/account/tokens)<br>2. Click "New Token"<br>3. Name: "GitHub Actions Staging"<br>4. Copy the token |
| `RAILWAY_STAGING_PROJECT_ID` | Railway project ID for staging agent | 1. Go to your Railway staging project<br>2. Copy the Project ID from the URL or settings<br>3. **Note**: Separate from production Railway project |

### 🗄️ Supabase Staging Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `STAGING_SUPABASE_URL` | Staging Supabase project URL | 1. Go to your staging Supabase project<br>2. Settings → API<br>3. Copy the Project URL |
| `STAGING_SUPABASE_PUBLISHABLE_KEY` | Staging Supabase anon key | 1. Go to your staging Supabase project<br>2. Settings → API<br>3. Copy the anon/public key |
| `STAGING_SUPABASE_SECRET_KEY` | Staging Supabase service role key | 1. Go to your staging Supabase project<br>2. Settings → API<br>3. Copy the service_role key |

### 🤖 OpenAI Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `STAGING_OPENAI_API_KEY` | OpenAI API key for staging | 1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)<br>2. Click "Create new secret key"<br>3. Name: "Chef Chopsky Staging"<br>4. Copy the key<br>5. **Note**: Can be same as production for cost efficiency |

### 📊 LangSmith Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `LANGCHAIN_API_KEY` | LangSmith API key for tracing | 1. Go to [smith.langchain.com/settings](https://smith.langchain.com/settings)<br>2. Copy your API key<br>3. **Note**: Same as production, uses staging project name |

## Setting Up GitHub Secrets

### Step 1: Access Repository Settings
1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"

### Step 2: Add Each Secret
1. Click "New repository secret"
2. Enter the secret name (exactly as listed above)
3. Enter the secret value
4. Click "Add secret"

### Step 3: Verify Secrets
After adding all secrets, you should see:
- ✅ `VERCEL_TOKEN`
- ✅ `VERCEL_PROJECT_ID`
- ✅ `RAILWAY_STAGING_TOKEN`
- ✅ `RAILWAY_STAGING_PROJECT_ID`
- ✅ `STAGING_SUPABASE_URL`
- ✅ `STAGING_SUPABASE_PUBLISHABLE_KEY`
- ✅ `STAGING_SUPABASE_SECRET_KEY`
- ✅ `STAGING_OPENAI_API_KEY`
- ✅ `LANGCHAIN_API_KEY`

## Workflow Triggers

### Automatic Triggers
- **Push to `staging` branch**: Automatically triggers staging deployment
- **Push to `feat/*` branches**: Automatically triggers feature branch staging deployment
- **Push to `feature/*` branches**: Automatically triggers feature branch staging deployment
- **Pull requests**: Triggers staging deployment for PR validation

### Manual Triggers
1. Go to "Actions" tab in your repository
2. Select "Staging Deployment" workflow
3. Click "Run workflow"
4. Choose branch: `staging` or any feature branch
5. Optionally check "Force deployment even if tests fail"
6. Click "Run workflow"

## Environment Variables Mapping

### Frontend (Vercel Preview) Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=${{ secrets.STAGING_SUPABASE_URL }}
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${{ secrets.STAGING_SUPABASE_PUBLISHABLE_KEY }}
SUPABASE_SECRET_KEY=${{ secrets.STAGING_SUPABASE_SECRET_KEY }}
AGENT_SERVICE_URL=https://chef-chopsky-staging.up.railway.app
NODE_ENV=staging
NEXT_PUBLIC_APP_ENV=staging
```

### Agent (Railway Staging) Environment Variables
```bash
NODE_ENV=staging
PORT=3001
OPENAI_API_KEY=${{ secrets.STAGING_OPENAI_API_KEY }}
LANGCHAIN_TRACING=true
LANGCHAIN_PROJECT=chef-chopsky-staging
LANGCHAIN_API_KEY=${{ secrets.LANGCHAIN_API_KEY }}
FRONTEND_URL=${{ needs.setup.outputs.deployment-url }}
RETRIEVER_PROVIDER=pinecone
EMBEDDING_MODEL=openai/text-embedding-3-small
LANGCHAIN_INDEX_NAME=chef-chopsky-staging
APP_ENV=staging
```

## Deployment URLs

### Staging Branch Deployments
- **Frontend**: `https://chef-chopsky-git-staging.vercel.app`
- **Agent**: `https://chef-chopsky-staging.up.railway.app`
- **Health Check**: `https://chef-chopsky-staging.up.railway.app/health`

### Feature Branch Deployments
- **Frontend Pattern**: `https://chef-chopsky-git-{branch-name}.vercel.app`
- **Agent**: `https://chef-chopsky-staging.up.railway.app` (shared)
- **Health Check**: `https://chef-chopsky-staging.up.railway.app/health`

### Examples
- `feat/new-recipe-search` → `https://chef-chopsky-git-feat-new-recipe-search.vercel.app`
- `feature/user-auth` → `https://chef-chopsky-git-feature-user-auth.vercel.app`

## Security Best Practices

### ✅ Do's
- Use separate staging projects for Supabase and Railway
- Use staging-specific API keys when possible
- Monitor staging resource usage
- Keep staging data separate from production
- Use preview environment variables in Vercel

### ❌ Don'ts
- Don't use production secrets in staging
- Don't commit secrets to the repository
- Don't share staging URLs publicly
- Don't use production database for staging
- Don't ignore staging environment costs

## Troubleshooting

### Common Issues

#### "Invalid Vercel token"
- Verify the token is correct and not expired
- Ensure the token has access to the project
- Check that the project ID matches

#### "Railway staging deployment failed"
- Verify Railway staging token is valid
- Check that the staging project ID is correct
- Ensure the agent folder is properly configured
- Verify staging project exists and is active

#### "Supabase staging connection failed"
- Verify all three staging Supabase secrets are correct
- Check that the staging Supabase project is active
- Ensure the project URL format is correct
- Verify database schema is applied to staging

#### "OpenAI API key invalid"
- Verify the API key is correct and active
- Check that the key has sufficient credits
- Ensure the key has the correct permissions

### Getting Help
1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are correctly set
3. Test individual services manually before running the full workflow
4. Check service-specific dashboards (Vercel, Railway, Supabase) for issues

## Cost Management

### Staging Environment Costs
- **Vercel**: Free tier (100GB bandwidth, unlimited preview deployments)
- **Railway**: Free tier (100GB bandwidth, 1GB RAM)
- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **OpenAI**: Shared with production (pay-per-use)
- **Pinecone**: Separate staging index (pay-per-use)

### Estimated Monthly Cost
- **Staging**: $5-15/month (Pinecone + OpenAI API usage)
- **Feature Branches**: Additional costs based on usage

## Next Steps

After setting up all secrets:
1. Test the workflow with a small change to `staging` branch
2. Test feature branch deployment with `feat/test-deployment`
3. Monitor the deployment logs
4. Verify staging URLs are accessible
5. Set up staging access control (password protection)
6. Configure monitoring and alerting for staging
7. Document staging-specific procedures
