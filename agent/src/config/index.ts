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
  
  // Optional LangSmith configuration
  langsmithApiKey: process.env.LANGSMITH_API_KEY,
  langsmithTracing: process.env.LANGSMITH_TRACING === 'true',
  langsmithProject: process.env.LANGSMITH_PROJECT || 'chef chopsky',
  
  // Environment settings
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // LangGraph specific settings
  langgraphPort: parseInt(process.env.LANGGRAPH_PORT || '2024'),
  langgraphHost: process.env.LANGGRAPH_HOST || 'localhost',
  
  // Express server settings
  serverPort: parseInt(process.env.PORT || '3001'),
  serverHost: process.env.HOST || 'localhost',
};

// Validate required configuration
function validateConfig() {
  const required = ['openaiApiKey'];
  const missing = required.filter(key => !config[key as keyof typeof config]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file or environment variables.'
    );
  }
}

// Validate configuration on import
validateConfig();

// Export configuration for use in other modules
export default config;
