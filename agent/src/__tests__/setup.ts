// Test setup file
import { beforeAll, afterAll } from '@jest/globals';
import { config } from '../config/index.js';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Starting Chef Chopsky Agent Tests...');
  console.log('📋 Make sure LangGraph dev server is running on port 2024');
  console.log('🔍 Make sure LangSmith environment variables are set');
  
  // Check configuration using our centralized config
  console.log('📋 Configuration Status:');
  console.log(`   - OpenAI API Key: ${config.openaiApiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   - LangSmith API Key: ${config.langsmithApiKey ? '✅ Set' : 'ℹ️ Not set (tracing disabled)'}`);
  console.log(`   - LangSmith Tracing: ${config.langsmithTracing ? '✅ Enabled' : 'ℹ️ Disabled'}`);
  console.log(`   - LangSmith Project: ${config.langsmithProject}`);
});

afterAll(async () => {
  console.log('✅ Chef Chopsky Agent Tests Complete!');
});
