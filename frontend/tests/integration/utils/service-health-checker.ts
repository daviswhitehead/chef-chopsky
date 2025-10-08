// Service health check utilities for integration tests
import { Logger } from '../e2e/fixtures/logger';

export interface ServiceConfig {
  name: string;
  url: string;
  healthPath?: string;
  timeout?: number;
}

export interface HealthCheckResult {
  service: string;
  healthy: boolean;
  responseTime: number;
  error?: string;
  status?: number;
}

export class ServiceHealthChecker {
  private services: ServiceConfig[] = [];
  private defaultTimeout = 5000;

  constructor(services: ServiceConfig[] = []) {
    this.services = services;
  }

  addService(service: ServiceConfig): void {
    this.services.push(service);
  }

  async checkService(service: ServiceConfig): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const timeout = service.timeout || this.defaultTimeout;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${service.url}${service.healthPath || ''}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      return {
        service: service.name,
        healthy: response.ok,
        responseTime,
        status: response.status
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: service.name,
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkAllServices(): Promise<HealthCheckResult[]> {
    Logger.info(`🔍 Checking health of ${this.services.length} services...`);
    
    const results = await Promise.all(
      this.services.map(service => this.checkService(service))
    );
    
    const healthyCount = results.filter(r => r.healthy).length;
    Logger.info(`✅ ${healthyCount}/${this.services.length} services are healthy`);
    
    return results;
  }

  async waitForServices(maxWaitTime: number = 30000): Promise<boolean> {
    const checkInterval = 1000; // 1 second
    let waited = 0;
    
    Logger.info(`⏳ Waiting for services to be ready (max ${maxWaitTime}ms)...`);
    
    while (waited < maxWaitTime) {
      const results = await this.checkAllServices();
      const allHealthy = results.every(r => r.healthy);
      
      if (allHealthy) {
        Logger.info('🎉 All services are healthy!');
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }
    
    Logger.warn('⚠️ Services did not become healthy within timeout');
    return false;
  }
}

// Default service configurations
export const DEFAULT_SERVICES: ServiceConfig[] = [
  {
    name: 'Frontend',
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    healthPath: '/',
    timeout: 5000
  },
  {
    name: 'Agent',
    url: process.env.AGENT_URL || 'http://localhost:3001',
    healthPath: '/health',
    timeout: 5000
  }
];

// Utility function for quick health checks
export async function quickHealthCheck(): Promise<boolean> {
  const checker = new ServiceHealthChecker(DEFAULT_SERVICES);
  const results = await checker.checkAllServices();
  return results.every(r => r.healthy);
}

// Utility function to wait for services
export async function waitForServices(maxWaitTime?: number): Promise<boolean> {
  const checker = new ServiceHealthChecker(DEFAULT_SERVICES);
  return await checker.waitForServices(maxWaitTime);
}
