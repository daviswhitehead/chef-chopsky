// Integration test setup file
// This file runs before all integration tests

import { Logger } from '../e2e/fixtures/logger';

// Set up global test configuration
beforeAll(async () => {
  Logger.info('🚀 Setting up integration test environment...');

  // Set longer timeout for integration tests
  jest.setTimeout(60000);

  // Set up global error handling
  process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception:', error);
  });

  Logger.info('✅ Integration test environment setup complete');
});

afterAll(async () => {
  Logger.info('🧹 Cleaning up integration test environment...');

  // Clean up any global resources if needed
  Logger.info('✅ Integration test environment cleanup complete');
});

// Global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      integrationTestConfig: {
        frontendUrl: string;
        agentUrl: string;
        timeout: number;
      };
    }
  }
}

// Set default configuration
global.integrationTestConfig = {
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  agentUrl: process.env.AGENT_URL || 'http://localhost:3001',
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000')
};

// Note: Integration tests now use direct fetch calls instead of complex class-based setup