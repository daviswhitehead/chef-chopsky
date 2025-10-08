// Environment loader - MUST be imported first, before any LangChain imports
// This ensures environment variables are loaded with proper priority before LangChain reads them

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables with proper priority
// Priority: .env.local > .env.development/.env.production/.env.test > .env
const nodeEnv = process.env.NODE_ENV || 'development';

// Load .env.local first (highest priority)
const localEnv = dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Load environment-specific file (e.g., .env.development, .env.production)
const envSpecificEnv = dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });

// Load base .env file (lowest priority)
const baseEnv = dotenv.config();

// Explicitly set environment variables to ensure LangChain picks them up
// This is necessary because Node.js caches process.env and LangChain reads it directly
if (localEnv.parsed) {
  Object.assign(process.env, localEnv.parsed);
}
if (envSpecificEnv.parsed) {
  Object.assign(process.env, envSpecificEnv.parsed);
}
if (baseEnv.parsed) {
  Object.assign(process.env, baseEnv.parsed);
}

// Force set critical environment variables to ensure they're available
// This is a more aggressive approach to ensure LangChain gets the right values
if (localEnv.parsed?.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = localEnv.parsed.OPENAI_API_KEY;
}
if (localEnv.parsed?.LANGCHAIN_API_KEY) {
  process.env.LANGCHAIN_API_KEY = localEnv.parsed.LANGCHAIN_API_KEY;
}
if (localEnv.parsed?.LANGCHAIN_PROJECT) {
  process.env.LANGCHAIN_PROJECT = localEnv.parsed.LANGCHAIN_PROJECT;
}
if (localEnv.parsed?.LANGCHAIN_TRACING) {
  process.env.LANGCHAIN_TRACING = localEnv.parsed.LANGCHAIN_TRACING;
}

console.log('🔧 Environment loaded with priority: .env.local > .env.development > .env');
console.log(`🔧 OpenAI API Key: ${process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'Not set'}`);
console.log(`🔧 LangSmith API Key: ${process.env.LANGCHAIN_API_KEY ? `${process.env.LANGCHAIN_API_KEY.substring(0, 10)}...` : 'Not set'}`);
console.log(`🔧 LangSmith Project: ${process.env.LANGCHAIN_PROJECT || 'Not set'}`);
console.log(`🔧 LangSmith Tracing: ${process.env.LANGCHAIN_TRACING || 'Not set'}`);
