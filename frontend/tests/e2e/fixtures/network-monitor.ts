import { Page } from '@playwright/test';
import { Logger } from './logger';

export interface NetworkRequest {
  url: string;
  method: string;
  postData?: string | null;
  timestamp: number;
  status?: number;
}

export interface ExpectedCall {
  url: string;
  method: string;
  status?: number;
  containsPayload?: string;
}

/**
 * Network monitoring utility for E2E tests
 * Captures and validates API calls during test execution
 */
export class NetworkMonitor {
  private requests: NetworkRequest[] = [];
  private isMonitoring = false;

  /**
   * Start monitoring network requests
   */
  async startMonitoring(page: Page): Promise<void> {
    if (this.isMonitoring) {
      Logger.warn('Network monitoring already started');
      return;
    }

    this.requests = [];
    this.isMonitoring = true;

    page.on('request', request => {
      const requestData: NetworkRequest = {
        url: request.url(),
        method: request.method(),
        postData: request.postData(),
        timestamp: Date.now(),
        status: undefined // Will be updated when response comes
      };
      
      this.requests.push(requestData);
      
      // Store reference to update status later
      (request as any).__networkRequest = requestData;
    });

    page.on('response', response => {
      // Find the matching request and update its status
      const matchingRequest = this.requests.find(req => 
        req.url === response.url() && 
        req.timestamp >= Date.now() - 5000 && // Within last 5 seconds
        req.status === undefined
      );
      
      if (matchingRequest) {
        matchingRequest.status = response.status();
      }
    });

    Logger.info('Network monitoring started');
  }

  /**
   * Stop monitoring network requests
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    Logger.info('Network monitoring stopped');
  }

  /**
   * Get all captured requests
   */
  getAllRequests(): NetworkRequest[] {
    return [...this.requests];
  }

  /**
   * Get API calls for a specific endpoint
   */
  getApiCalls(endpoint: string): NetworkRequest[] {
    return this.requests.filter(req => req.url.includes(endpoint));
  }

  /**
   * Get requests by method
   */
  getRequestsByMethod(method: string): NetworkRequest[] {
    return this.requests.filter(req => req.method.toUpperCase() === method.toUpperCase());
  }

  /**
   * Verify expected API calls were made
   */
  verifyExpectedCalls(expectedCalls: ExpectedCall[]): { passed: boolean; details: string[] } {
    const results: string[] = [];
    let allPassed = true;

    for (const expected of expectedCalls) {
      const matchingRequests = this.requests.filter(req => 
        req.url.includes(expected.url) && 
        req.method.toUpperCase() === expected.method.toUpperCase()
      );

      if (matchingRequests.length === 0) {
        results.push(`❌ Expected ${expected.method} ${expected.url} - NOT FOUND`);
        allPassed = false;
      } else {
        const request = matchingRequests[0];
        let statusOk = true;
        
        if (expected.status && request.status !== expected.status) {
          results.push(`❌ Expected ${expected.method} ${expected.url} - Status ${request.status} (expected ${expected.status})`);
          statusOk = false;
        }

        if (expected.containsPayload && request.postData && !request.postData.includes(expected.containsPayload)) {
          results.push(`❌ Expected ${expected.method} ${expected.url} - Payload missing "${expected.containsPayload}"`);
          statusOk = false;
        }

        if (statusOk) {
          results.push(`✅ ${expected.method} ${expected.url} - Status ${request.status}`);
        } else {
          allPassed = false;
        }
      }
    }

    return { passed: allPassed, details: results };
  }

  /**
   * Clear captured requests
   */
  clearRequests(): void {
    this.requests = [];
    Logger.info('Network requests cleared');
  }

  /**
   * Get summary of captured requests
   */
  getSummary(): string {
    const apiCalls = this.requests.filter(req => req.url.includes('/api/'));
    const methods = [...new Set(apiCalls.map(req => req.method))];
    
    return `Captured ${this.requests.length} total requests, ${apiCalls.length} API calls. Methods: ${methods.join(', ')}`;
  }
}

/**
 * Test 4 specific network verification
 * Validates the exact requirements from the manual testing guide
 */
export class Test4NetworkVerifier {
  private monitor: NetworkMonitor;

  constructor(monitor: NetworkMonitor) {
    this.monitor = monitor;
  }

  /**
   * Verify Test 4 requirements: Browser Network Tab Verification
   */
  verifyTest4Requirements(): { passed: boolean; details: string[] } {
    const results: string[] = [];
    let allPassed = true;

    // Expected API calls from Test 4 - be more flexible about endpoints
    const expectedCalls: ExpectedCall[] = [
      {
        url: '/api/ai/chat',
        method: 'POST',
        status: 200,
        containsPayload: 'conversationId'
      }
    ];

    // Check for conversation-related calls (either direct API or Supabase)
    const conversationCalls = this.monitor.getApiCalls('/api/conversations');
    const supabaseConversationCalls = this.monitor.getApiCalls('supabase.co/rest/v1/conversations');
    
    if (conversationCalls.length > 0 || supabaseConversationCalls.length > 0) {
      // Add GET call for retrieving conversations
      expectedCalls.push({
        url: '/api/conversations',
        method: 'GET',
        status: 200
      });
      
      // Add POST call if conversation was created
      const conversationPosts = [...conversationCalls, ...supabaseConversationCalls].filter(req => req.method === 'POST');
      if (conversationPosts.length > 0) {
        expectedCalls.push({
          url: '/api/conversations',
          method: 'POST',
          status: 201
        });
      }
    }

    // Verify each expected call
    const verification = this.monitor.verifyExpectedCalls(expectedCalls);
    results.push(...verification.details);

    if (!verification.passed) {
      allPassed = false;
    }

    // Additional Test 4 validations
    const apiCalls = this.monitor.getApiCalls('/api/');
    
    // Check for unnecessary or duplicate calls
    const duplicateCalls = this.findDuplicateCalls(apiCalls);
    if (duplicateCalls.length > 0) {
      results.push(`⚠️  Found ${duplicateCalls.length} potential duplicate API calls`);
    }

    // Check for error responses
    const errorCalls = apiCalls.filter(req => req.status && req.status >= 400);
    if (errorCalls.length > 0) {
      results.push(`⚠️  Found ${errorCalls.length} API calls with error status codes`);
    }

    // Summary
    results.push(`\n📊 Network Summary: ${this.monitor.getSummary()}`);

    return { passed: allPassed, details: results };
  }

  private findDuplicateCalls(requests: NetworkRequest[]): NetworkRequest[] {
    const seen = new Set<string>();
    const duplicates: NetworkRequest[] = [];

    for (const req of requests) {
      const key = `${req.method}:${req.url}`;
      if (seen.has(key)) {
        duplicates.push(req);
      } else {
        seen.add(key);
      }
    }

    return duplicates;
  }
}
