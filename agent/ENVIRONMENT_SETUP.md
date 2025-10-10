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
- `OPENAI_API_KEY` - Your OpenAI API key
- `FRONTEND_URL` - URL of your frontend application
- `LANGCHAIN_PROJECT` - LangSmith project name

**Optional Variables:**
- `LANGCHAIN_API_KEY` - LangSmith API key for tracing
- `RETRIEVER_PROVIDER` - Vector store provider (memory/pinecone/elastic/mongodb)
- `SENTRY_DSN` - Error monitoring DSN
- Feature flags and debug settings

### 3. Environment-Specific Notes

#### Local Development (`env.local.example`)
- Uses localhost URLs for services
- Enables debug mode and detailed logging
- Uses memory-based retriever for simplicity
- LangSmith tracing enabled for development

#### Staging (`env.staging.example`)
- Points to staging service URLs
- Uses production-like configuration with monitoring
- Uses Pinecone for vector storage
- Full monitoring enabled

#### Production (`env.production.example`)
- Production service URLs
- Full monitoring and error reporting enabled
- Security and performance optimizations
- Feature flags disabled for stability
- Rate limiting and request validation enabled

## Vector Store Configuration

### Memory (Local Development)
```bash
RETRIEVER_PROVIDER=memory
```

### Pinecone (Staging/Production)
```bash
RETRIEVER_PROVIDER=pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
```

### MongoDB (Alternative)
```bash
RETRIEVER_PROVIDER=mongodb
MONGODB_CONNECTION_STRING=your_mongodb_connection_string
```

### Elastic (Alternative)
```bash
RETRIEVER_PROVIDER=elastic
ELASTIC_CLOUD_ID=your_elastic_cloud_id
ELASTIC_API_KEY=your_elastic_api_key
```

## Security Notes

⚠️ **Never commit actual environment files to version control**
- Only commit `.example` files
- Add `.env*` to your `.gitignore` file
- Use environment variable injection in production deployments

## Environment Variable Priority

The agent service loads environment variables in this order:
1. `.env.local`
2. `.env.development` / `.env.production` / `.env.test`
3. `.env`

## Troubleshooting

### Common Issues
1. **OpenAI API errors**: Verify your `OPENAI_API_KEY` is valid and has sufficient credits
2. **CORS errors**: Ensure `FRONTEND_URL` matches your frontend application URL
3. **Vector store errors**: Check your vector store credentials and configuration
4. **LangSmith tracing issues**: Verify your `LANGCHAIN_API_KEY` and project name

### Validation
Use the health check endpoint to verify configuration:
- Agent: `http://localhost:3001/health`

### Environment Discrimination
The `APP_ENV` variable ensures data isolation between environments:
- `local` - Development data
- `staging` - Staging data  
- `production` - Production data

This prevents cross-environment data bleed in vector stores and other services.
