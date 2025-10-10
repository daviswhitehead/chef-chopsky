# Production Deployment Secrets Configuration

## Overview
This document outlines all the required GitHub secrets for automated production deployment on the `main` branch.

## Required GitHub Secrets

### 🔐 Vercel Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel authentication token | 1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)<br>2. Click "Create Token"<br>3. Name: "GitHub Actions Production"<br>4. Copy the token |
| `VERCEL_PROJECT_ID` | Vercel project ID for production | 1. Go to your Vercel project settings<br>2. Copy the Project ID from the General tab |

### 🚂 Railway Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `RAILWAY_TOKEN` | Railway authentication token | 1. Go to [railway.app/account/tokens](https://railway.app/account/tokens)<br>2. Click "New Token"<br>3. Name: "GitHub Actions Production"<br>4. Copy the token |
| `RAILWAY_PROJECT_ID` | Railway project ID for agent service | 1. Go to your Railway project<br>2. Copy the Project ID from the URL or settings |

### 🗄️ Supabase Production Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `PRODUCTION_SUPABASE_URL` | Production Supabase project URL | 1. Go to your production Supabase project<br>2. Settings → API<br>3. Copy the Project URL |
| `PRODUCTION_SUPABASE_PUBLISHABLE_KEY` | Production Supabase anon key | 1. Go to your production Supabase project<br>2. Settings → API<br>3. Copy the anon/public key |
| `PRODUCTION_SUPABASE_SECRET_KEY` | Production Supabase service role key | 1. Go to your production Supabase project<br>2. Settings → API<br>3. Copy the service_role key |

### 🤖 OpenAI Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `PRODUCTION_OPENAI_API_KEY` | OpenAI API key for production | 1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)<br>2. Click "Create new secret key"<br>3. Name: "Chef Chopsky Production"<br>4. Copy the key |

### 📊 LangSmith Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `LANGCHAIN_API_KEY` | LangSmith API key for tracing | 1. Go to [smith.langchain.com/settings](https://smith.langchain.com/settings)<br>2. Copy your API key |

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
- ✅ `RAILWAY_TOKEN`
- ✅ `RAILWAY_PROJECT_ID`
- ✅ `PRODUCTION_SUPABASE_URL`
- ✅ `PRODUCTION_SUPABASE_PUBLISHABLE_KEY`
- ✅ `PRODUCTION_SUPABASE_SECRET_KEY`
- ✅ `PRODUCTION_OPENAI_API_KEY`
- ✅ `LANGCHAIN_API_KEY`

## Workflow Triggers

### Automatic Triggers
- **Push to `main` branch**: Automatically triggers production deployment
- **Manual trigger**: Can be triggered manually via GitHub Actions UI

### Manual Deployment
1. Go to "Actions" tab in your repository
2. Select "Production Deployment" workflow
3. Click "Run workflow"
4. Choose branch: `main`
5. Optionally check "Force deployment even if tests fail"
6. Click "Run workflow"

## Environment Variables Mapping

### Frontend (Vercel) Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=${{ secrets.PRODUCTION_SUPABASE_URL }}
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${{ secrets.PRODUCTION_SUPABASE_PUBLISHABLE_KEY }}
SUPABASE_SECRET_KEY=${{ secrets.PRODUCTION_SUPABASE_SECRET_KEY }}
AGENT_SERVICE_URL=https://chef-chopsky-production.up.railway.app
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

### Agent (Railway) Environment Variables
```bash
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=${{ secrets.PRODUCTION_OPENAI_API_KEY }}
LANGCHAIN_TRACING=true
LANGCHAIN_PROJECT=chef-chopsky-production
LANGCHAIN_API_KEY=${{ secrets.LANGCHAIN_API_KEY }}
FRONTEND_URL=https://chef-chopsky-production.vercel.app
RETRIEVER_PROVIDER=pinecone
EMBEDDING_MODEL=openai/text-embedding-3-small
LANGCHAIN_INDEX_NAME=chef-chopsky-production
APP_ENV=production
```

## Security Best Practices

### ✅ Do's
- Use separate API keys for production vs development
- Rotate secrets regularly (quarterly)
- Use least-privilege access tokens
- Monitor secret usage in GitHub Actions logs
- Keep secrets in GitHub Secrets, never in code

### ❌ Don'ts
- Don't commit secrets to the repository
- Don't use development keys in production
- Don't share secrets via email or chat
- Don't use overly broad API key permissions
- Don't ignore secret rotation schedules

## Troubleshooting

### Common Issues

#### "Invalid Vercel token"
- Verify the token is correct and not expired
- Ensure the token has access to the production project
- Check that the project ID matches

#### "Railway deployment failed"
- Verify Railway token is valid
- Check that the project ID is correct
- Ensure the agent folder is properly configured

#### "Supabase connection failed"
- Verify all three Supabase secrets are correct
- Check that the production Supabase project is active
- Ensure the project URL format is correct

#### "OpenAI API key invalid"
- Verify the API key is correct and active
- Check that the key has sufficient credits
- Ensure the key has the correct permissions

### Getting Help
1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are correctly set
3. Test individual services manually before running the full workflow
4. Check service-specific dashboards (Vercel, Railway, Supabase) for issues

## Next Steps

After setting up all secrets:
1. Test the workflow with a small change to `main` branch
2. Monitor the deployment logs
3. Verify production URLs are accessible
4. Set up monitoring and alerting (Task 2.10)
5. Document rollback procedures (Task 2.11)
