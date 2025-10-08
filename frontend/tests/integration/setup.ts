// Integration test setup file
// This file runs before all integration tests

import { Logger } from '../e2e/fixtures/logger';
import { ServiceHealthChecker, DEFAULT_SERVICES } from './utils/service-health-checker';

// Global health checker instance
let healthChecker: ServiceHealthChecker;

// Set up global test configuration
beforeAll(async () => {
  Logger.info('🚀 Setting up integration test environment...');

  // Set longer timeout for integration tests
  jest.setTimeout(60000);

  // Initialize health checker
  healthChecker = new ServiceHealthChecker(DEFAULT_SERVICES);

  // Check if services are available (but don't fail if they're not)
  try {
    const results = await healthChecker.checkAllServices();
    const healthyCount = results.filter(r => r.healthy).length;
    
    if (healthyCount === 0) {
      Logger.warn('⚠️ No services are currently running - tests may fail');
      Logger.warn('💡 Run "npm run dev" in both frontend and agent directories');
    } else if (healthyCount < results.length) {
      Logger.warn(`⚠️ Only ${healthyCount}/${results.length} services are running`);
    } else {
      Logger.info('✅ All services are healthy and ready for testing');
    }
  } catch (error) {
    Logger.warn('⚠️ Could not check service health:', error);
  }

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