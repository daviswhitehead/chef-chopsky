# Railway Environment Configuration Template
# This file documents the required environment variables for the Chef Chopsky Agent Service
# Use this as a reference when setting up Railway environments

# =============================================================================
# REQUIRED ENVIRONMENT VARIABLES
# =============================================================================

# OpenAI Configuration (Required)
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# LangSmith Configuration (Optional but recommended)
LANGCHAIN_TRACING=true
LANGCHAIN_PROJECT=chef-chopsky-production
LANGCHAIN_API_KEY=lsv2_pt_your-langsmith-api-key-here

# Server Configuration
PORT=3001
# IMPORTANT: Do NOT set HOST=localhost in production!
# HOST is auto-set to 0.0.0.0 in production for Railway compatibility
# Setting HOST=localhost will cause healthcheck failures
NODE_ENV=production
LOG_LEVEL=info

# Frontend Integration (Required for CORS)
FRONTEND_URL=https://your-frontend.vercel.app

# LangGraph Configuration
LANGGRAPH_PORT=2024
LANGGRAPH_HOST=localhost

# Retriever & Embeddings Configuration
RETRIEVER_PROVIDER=pinecone
EMBEDDING_MODEL=openai/text-embedding-3-small

# Vector Store Configuration
LANGCHAIN_INDEX_NAME=chef-chopsky-production
MONGO_NAMESPACE_PREFIX=retrieval

# Environment Discriminator
APP_ENV=production

# =============================================================================
# ENVIRONMENT-SPECIFIC VALUES
# =============================================================================

# Local Development
# RETRIEVER_PROVIDER=memory
# LANGCHAIN_PROJECT=chef-chopsky-local
# APP_ENV=local
# NODE_ENV=development

# Staging Environment
# RETRIEVER_PROVIDER=elastic-local
# LANGCHAIN_PROJECT=chef-chopsky-staging
# APP_ENV=staging
# NODE_ENV=production

# Production Environment
# RETRIEVER_PROVIDER=pinecone
# LANGCHAIN_PROJECT=chef-chopsky-production
# APP_ENV=production
# NODE_ENV=production

# =============================================================================
# RAILWAY-SPECIFIC VARIABLES (Auto-set by Railway)
# =============================================================================

# These are automatically set by Railway - do not override:
# RAILWAY_PROJECT_ID
# RAILWAY_ENVIRONMENT_ID
# RAILWAY_SERVICE_ID
# RAILWAY_STATIC_URL
# PORT (Railway sets this automatically)

# =============================================================================
# SETUP INSTRUCTIONS
# =============================================================================

# 1. Copy this file to .env.production
# 2. Replace placeholder values with actual API keys and URLs
# 3. Run: npm run sync:env (to sync to Railway)
# 4. Or manually set variables in Railway dashboard

# =============================================================================
# VALIDATION
# =============================================================================

# The agent service will validate these variables on startup:
# - OPENAI_API_KEY must be set and valid
# - FRONTEND_URL must be set for CORS
# - All other variables have sensible defaults

# =============================================================================
# SECURITY NOTES
# =============================================================================

# - Never commit actual API keys to version control
# - Use Railway's encrypted environment variable storage
# - Rotate API keys regularly
# - Monitor usage and costs
