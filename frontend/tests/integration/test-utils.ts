/**
 * Test utilities for integration tests
 */

export interface ServiceStatus {
  isRunning: boolean;
  error?: string;
}

/**
 * Check if agent service is running
 */
export async function checkAgentServiceStatus(): Promise<ServiceStatus> {
  try {
    const response = await fetch('http://localhost:3001/health', {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    
    if (response.ok) {
      return { isRunning: true };
    } else {
      return { isRunning: false, error: `Health check failed with status ${response.status}` };
    }
  } catch (error: any) {
    return { 
      isRunning: false, 
      error: error.message || 'Service unreachable' 
    };
  }
}

/**
 * Check if frontend service is running
 */
export async function checkFrontendServiceStatus(): Promise<ServiceStatus> {
  try {
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    
    if (response.ok) {
      return { isRunning: true };
    } else {
      return { isRunning: false, error: `Health check failed with status ${response.status}` };
    }
  } catch (error: any) {
    return { 
      isRunning: false, 
      error: error.message || 'Service unreachable' 
    };
  }
}

/**
 * Get expected status codes based on service availability
 */
export function getExpectedStatusCodes(serviceRunning: boolean): number[] {
  if (serviceRunning) {
    return [200, 500]; // Service running - expect success or server error
  } else {
    return [502]; // Service down - expect bad gateway
  }
}

/**
 * Get expected error message based on service availability
 */
export function getExpectedErrorMessage(serviceRunning: boolean): string {
  if (serviceRunning) {
    return 'Network request failed'; // Service running but request failed
  } else {
    return 'fetch failed'; // Service down - fetch fails
  }
}

/**
 * Log service status for debugging
 */
export function logServiceStatus(serviceName: string, status: ServiceStatus): void {
  if (status.isRunning) {
    console.log(`✅ ${serviceName} service is running`);
  } else {
    console.log(`❌ ${serviceName} service is down: ${status.error}`);
  }
}
