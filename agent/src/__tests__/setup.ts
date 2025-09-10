// Test setup file
import { beforeAll, afterAll } from '@jest/globals';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Starting Chef Chopsky Agent Tests...');
  console.log('📋 Make sure LangGraph dev server is running on port 2024');
  console.log('🔍 Make sure LangSmith environment variables are set');
  
  // Check environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️ OPENAI_API_KEY not set. Tests may fail if the agent requires OpenAI API calls.');
  }
  if (!process.env.LANGSMITH_API_KEY) {
    console.log('ℹ️ LANGSMITH_API_KEY not set. LangSmith tracing will be disabled.');
  }
});

afterAll(async () => {
  console.log('✅ Chef Chopsky Agent Tests Complete!');
});
