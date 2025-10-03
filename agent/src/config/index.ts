import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Centralized configuration management for Chef Chopsky LangGraph Agent
 * 
 * This follows the 12-Factor App pattern:
 * - Configuration via environment variables
 * - No secrets in code
 * - Environment-specific settings
 */
export const config = {
  // Required environment variables
  openaiApiKey: process.env.OPENAI_API_KEY!,
  
  // Optional LangSmith configuration (using LangChain standard env vars)
  langsmithApiKey: process.env.LANGCHAIN_API_KEY,
  langsmithTracing: process.env.LANGCHAIN_TRACING === 'true',
  langsmithProject: process.env.LANGCHAIN_PROJECT || 'chef chopsky',
  
  // Environment settings
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // LangGraph specific settings
  langgraphPort: parseInt(process.env.LANGGRAPH_PORT || '2024'),
  langgraphHost: process.env.LANGGRAPH_HOST || 'localhost',
  
  // Express server settings
  serverPort: parseInt(process.env.PORT || '3001'),
  serverHost: process.env.NODE_ENV === 'production' ? '0.0.0.0' : (process.env.HOST || 'localhost'),
  
  // Retriever & Embeddings Configuration (Environment-driven)
  retrieverProvider: process.env.RETRIEVER_PROVIDER || 'memory',
  embeddingModel: process.env.EMBEDDING_MODEL || 'openai/text-embedding-3-small',
  
  // Vector Store Configuration (per-environment)
  langchainIndexName: process.env.LANGCHAIN_INDEX_NAME || 'chef-chopsky',
  mongoNamespacePrefix: process.env.MONGO_NAMESPACE_PREFIX || 'retrieval',
  
  // Environment discriminator for retrieval isolation
  appEnv: process.env.APP_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'local'),
};

// Validate required configuration and production safety
function validateConfig() {
  const required = ['openaiApiKey'];
  const missing = required.filter(key => !config[key as keyof typeof config]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file or environment variables.'
    );
  }
  
  // Production safety validation
  const isMockMode = config.openaiApiKey === 'test-key' || 
                     !config.openaiApiKey || 
                     config.openaiApiKey === 'your_openai_api_key_here';
  
  if (isMockMode && config.nodeEnv === 'production') {
    console.error('🚨 CRITICAL ERROR: Cannot run in production with invalid API key!');
    console.error('🚨 Production environment requires a valid OPENAI_API_KEY');
    console.error('🚨 Current API key status:', config.openaiApiKey ? 'Set but invalid' : 'Not set');
    console.error('🚨 This is a CRITICAL configuration error that must be fixed immediately.');
    console.error('🚨 Agent service will NOT start in production with invalid API key.');
    process.exit(1);
  }
  
  // Environment-specific retriever validation
  if (config.nodeEnv === 'production') {
    const validProductionRetrievers = ['pinecone', 'elastic', 'mongodb'];
    if (!validProductionRetrievers.includes(config.retrieverProvider)) {
      console.error('🚨 CRITICAL ERROR: Production environment requires a production-ready retriever!');
      console.error(`🚨 Current retriever: ${config.retrieverProvider}`);
      console.error(`🚨 Valid production retrievers: ${validProductionRetrievers.join(', ')}`);
      console.error('🚨 Set RETRIEVER_PROVIDER to a production-ready option (pinecone, elastic, mongodb)');
      process.exit(1);
    }
  }
  
  // Warn about mock mode in non-production environments
  if (isMockMode && config.nodeEnv !== 'production') {
    console.warn('⚠️  WARNING: Agent service is starting in MOCK MODE!');
    console.warn('⚠️  You will get fake responses instead of real AI responses.');
    console.warn('⚠️  To fix this:');
    console.warn('⚠️  1. Copy agent/.env.example to agent/.env');
    console.warn('⚠️  2. Edit agent/.env and set OPENAI_API_KEY=your_real_api_key');
    console.warn('⚠️  3. Restart the agent service');
    console.warn('⚠️  Current API key status:', config.openaiApiKey ? 'Set but invalid' : 'Not set');
  }
}

// Validate configuration on import
validateConfig();

// Export configuration for use in other modules
export default config;
