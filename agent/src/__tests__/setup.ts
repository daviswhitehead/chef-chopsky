// Test setup file
import { beforeAll, afterAll } from '@jest/globals';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Starting Chef Chopsky Agent Tests...');
  console.log('📋 Make sure LangGraph dev server is running on port 2024');
  console.log('🔍 Make sure LangSmith environment variables are set');
});

afterAll(async () => {
  console.log('✅ Chef Chopsky Agent Tests Complete!');
});
