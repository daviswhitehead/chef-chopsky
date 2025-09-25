/**
 * Centralized timeout configuration for the application
 * 
 * This ensures all services use consistent timeout values and prevents
 * timeout mismatches that can cause confusing behavior.
 */

// Base timeout configuration
export const TIMEOUT_CONFIG = {
  // Agent service timeout (how long the agent has to process a request)
  AGENT_PROCESSING: 120 * 1000, // 120 seconds (increased for complex requests)
  
  // Frontend API route timeout (how long the API route waits for agent)
  // Should be slightly longer than agent processing to account for network overhead
  API_ROUTE: 130 * 1000, // 130 seconds
  
  // Frontend component timeout (how long the UI waits for API response)
  // Should be slightly longer than API route to account for network overhead
  FRONTEND_COMPONENT: 140 * 1000, // 140 seconds
  
  // Retry configuration
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY_BASE: 1000, // Base delay in ms for exponential backoff
} as const;

/**
 * Get timeout configuration with validation
 */
export function getTimeoutConfig() {
  // Validate that timeouts are properly ordered
  if (TIMEOUT_CONFIG.FRONTEND_COMPONENT <= TIMEOUT_CONFIG.API_ROUTE) {
    throw new Error(
      'Frontend component timeout must be longer than API route timeout'
    );
  }
  
  if (TIMEOUT_CONFIG.API_ROUTE <= TIMEOUT_CONFIG.AGENT_PROCESSING) {
    throw new Error(
      'API route timeout must be longer than agent processing timeout'
    );
  }
  
  return TIMEOUT_CONFIG;
}

/**
 * Get timeout values in seconds for display purposes
 */
export function getTimeoutSeconds() {
  const config = getTimeoutConfig();
  return {
    agentProcessing: Math.floor(config.AGENT_PROCESSING / 1000),
    apiRoute: Math.floor(config.API_ROUTE / 1000),
    frontendComponent: Math.floor(config.FRONTEND_COMPONENT / 1000),
  };
}

/**
 * Environment-specific timeout overrides
 */
export function getEnvironmentTimeouts() {
  const baseConfig = getTimeoutConfig();
  
  // In development, we might want longer timeouts for debugging
  if (process.env.NODE_ENV === 'development') {
    return {
      ...baseConfig,
      AGENT_PROCESSING: baseConfig.AGENT_PROCESSING * 1.5, // 180 seconds
      API_ROUTE: baseConfig.API_ROUTE * 1.5, // 195 seconds
      FRONTEND_COMPONENT: baseConfig.FRONTEND_COMPONENT * 1.5, // 210 seconds
    };
  }
  
  return baseConfig;
}
