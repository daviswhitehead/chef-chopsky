import { getTimeoutConfig, getEnvironmentTimeouts, getTimeoutSeconds } from '@/lib/timeouts';

describe('Timeout Configuration', () => {
  describe('getTimeoutConfig', () => {
    it('should return valid timeout configuration', () => {
      const config = getTimeoutConfig();
      
      expect(config.AGENT_PROCESSING).toBe(120000); // 120 seconds
      expect(config.API_ROUTE).toBe(130000); // 130 seconds
      expect(config.FRONTEND_COMPONENT).toBe(140000); // 140 seconds
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
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true
      });
      
      const config = getEnvironmentTimeouts();
      
      expect(config.AGENT_PROCESSING).toBe(120000);
      expect(config.API_ROUTE).toBe(130000);
      expect(config.FRONTEND_COMPONENT).toBe(140000);
      
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      });
    });

    it('should return extended timeouts in development', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true
      });
      
      const config = getEnvironmentTimeouts();
      
      expect(config.AGENT_PROCESSING).toBe(180000); // 120 * 1.5
      expect(config.API_ROUTE).toBe(195000); // 130 * 1.5
      expect(config.FRONTEND_COMPONENT).toBe(210000); // 140 * 1.5
      
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      });
    });
  });

  describe('getTimeoutSeconds', () => {
    it('should return timeout values in seconds', () => {
      const seconds = getTimeoutSeconds();
      
      expect(seconds.agentProcessing).toBe(120);
      expect(seconds.apiRoute).toBe(130);
      expect(seconds.frontendComponent).toBe(140);
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
