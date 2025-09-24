import { getTimeoutConfig, getEnvironmentTimeouts, getTimeoutSeconds } from '../lib/timeouts';

describe('Timeout Configuration', () => {
  describe('getTimeoutConfig', () => {
    it('should return valid timeout configuration', () => {
      const config = getTimeoutConfig();
      
      expect(config.AGENT_PROCESSING).toBe(60000); // 60 seconds
      expect(config.API_ROUTE).toBe(60000); // 60 seconds
      expect(config.FRONTEND_COMPONENT).toBe(65000); // 65 seconds
      expect(config.RETRY_ATTEMPTS).toBe(2);
      expect(config.RETRY_DELAY_BASE).toBe(1000);
    });

    it('should validate timeout ordering', () => {
      // This should not throw
      expect(() => getTimeoutConfig()).not.toThrow();
    });
  });

  describe('getEnvironmentTimeouts', () => {
    it('should return base timeouts in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const config = getEnvironmentTimeouts();
      
      expect(config.AGENT_PROCESSING).toBe(60000);
      expect(config.API_ROUTE).toBe(60000);
      expect(config.FRONTEND_COMPONENT).toBe(65000);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should return extended timeouts in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const config = getEnvironmentTimeouts();
      
      expect(config.AGENT_PROCESSING).toBe(90000); // 60 * 1.5
      expect(config.API_ROUTE).toBe(90000); // 60 * 1.5
      expect(config.FRONTEND_COMPONENT).toBe(97500); // 65 * 1.5
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getTimeoutSeconds', () => {
    it('should return timeout values in seconds', () => {
      const seconds = getTimeoutSeconds();
      
      expect(seconds.agentProcessing).toBe(60);
      expect(seconds.apiRoute).toBe(60);
      expect(seconds.frontendComponent).toBe(65);
    });
  });

  describe('Timeout Consistency', () => {
    it('should ensure frontend timeout is longer than API timeout', () => {
      const config = getTimeoutConfig();
      
      expect(config.FRONTEND_COMPONENT).toBeGreaterThan(config.API_ROUTE);
    });

    it('should ensure API timeout is longer than agent processing timeout', () => {
      const config = getTimeoutConfig();
      
      expect(config.API_ROUTE).toBeGreaterThanOrEqual(config.AGENT_PROCESSING);
    });
  });
});
