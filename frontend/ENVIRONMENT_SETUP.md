# Environment Configuration Guide

This directory contains environment variable templates for different deployment environments.

## Available Environment Files

### Base Template
- `.env.example` - Core template with essential variables needed across all environments

### Environment-Specific Templates
- `.env.local.example` - Local development configuration
- `.env.staging.example` - Staging environment configuration  
- `.env.production.example` - Production environment configuration

## Setup Instructions

### 1. Choose Your Environment
Copy the appropriate template file to create your actual environment file:

```bash
# For local development
cp .env.local.example .env.local

# For staging
cp .env.staging.example .env.staging

# For production
cp .env.production.example .env.production
```

### 2. Configure Required Variables
Edit your environment file and replace placeholder values with actual configuration:

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Your Supabase publishable key
- `SUPABASE_SECRET_KEY` - Your Supabase secret key
- `AGENT_SERVICE_URL` - URL of your agent service

**Optional Variables:**
- `NEXT_PUBLIC_ANALYTICS_ID` - Analytics tracking ID
- `NEXT_PUBLIC_SENTRY_DSN` - Error monitoring DSN
- Feature flags and debug settings

### 3. Environment-Specific Notes

#### Local Development (`env.local.example`)
- Uses localhost URLs for services
- Enables debug mode and detailed logging
- Uses memory-based retriever for simplicity

#### Staging (`env.staging.example`)
- Points to staging service URLs
- Uses production-like configuration with monitoring
- Uses Pinecone for vector storage

#### Production (`env.production.example`)
- Production service URLs
- Full monitoring and error reporting enabled
- Security and performance optimizations
- Feature flags disabled for stability

## Security Notes

⚠️ **Never commit actual environment files to version control**
- Only commit `.example` files
- Add `.env*` to your `.gitignore` file
- Use environment variable injection in production deployments

## Environment Variable Priority

Next.js loads environment variables in this order:
1. `.env.local` (always loaded, except in test)
2. `.env.development` / `.env.production` / `.env.test`
3. `.env`

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure `AGENT_SERVICE_URL` matches your agent service URL
2. **Supabase connection issues**: Verify your Supabase credentials
3. **Environment mismatch**: Ensure `APP_ENV` matches between frontend and agent

### Validation
Use the health check endpoints to verify configuration:
- Frontend: `http://localhost:3000/api/health`
- Agent: `http://localhost:3001/health`
