import { Page, expect } from '@playwright/test';
import { Logger } from './logger';
import { TestDataGenerator, TestDataCleanup } from './test-data';

/**
 * Service health check utilities
 */
export class ServiceHealthChecker {
  private static servicesReady: boolean = false;

  /**
   * Check if frontend service is healthy
   */
  static async checkFrontendHealth(page: Page): Promise<boolean> {
    try {
      const response = await page.goto('/');
      return response?.ok() ?? false;
    } catch (error) {
      console.error('Frontend health check failed:', error);
      return false;
    }
  }

  /**
   * Check if agent service is healthy
   */
  static async checkAgentHealth(page: Page): Promise<boolean> {
    try {
      const response = await page.request.get('http://localhost:3001/health');
      return response.ok();
    } catch (error) {
      console.error('Agent health check failed:', error);
      return false;
    }
  }

  /**
   * Wait for both services to be healthy
   */
  static async waitForServices(page: Page, timeout = 30000): Promise<void> {
    if (this.servicesReady) {
      return;
    }
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const frontendHealthy = await this.checkFrontendHealth(page);
      const agentHealthy = await this.checkAgentHealth(page);
      
      if (frontendHealthy && agentHealthy) {
        Logger.info('Both services are healthy');
        this.servicesReady = true;
        return;
      }
      
      Logger.info('Waiting for services to be healthy...');
      await page.waitForTimeout(1000);
    }
    
    throw new Error('Services did not become healthy within timeout');
  }
}

/**
 * Test environment setup and teardown
 */
export class TestEnvironment {
  private testDataGenerator: TestDataGenerator;
  private testDataCleanup: TestDataCleanup;
  private currentPage?: Page;

  constructor() {
    this.testDataGenerator = new TestDataGenerator();
    this.testDataCleanup = new TestDataCleanup(this.testDataGenerator.getTestRunId());
  }

  /**
   * Setup test environment before each test
   */
  async setup(page: Page): Promise<void> {
    Logger.info(`Setting up test environment for run: ${this.testDataGenerator.getTestRunId()}`);
    this.currentPage = page;
    
    // Wait for services to be healthy
    await ServiceHealthChecker.waitForServices(page);
    
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  }

  /**
   * Cleanup test environment after each test
   */
  async cleanup(): Promise<void> {
    Logger.info(`Cleaning up test environment for run: ${this.testDataGenerator.getTestRunId()}`);
    // Shared route cleanup to avoid cross-test leakage
    try {
      if (this.currentPage) {
        await this.currentPage.unroute('**/api/ai/chat');
      }
    } catch (e) {
      Logger.warn('Unroute cleanup warning:', e);
    }
    await this.testDataCleanup.cleanupTestData();
  }

  /**
   * Get test data generator
   */
  getTestDataGenerator(): TestDataGenerator {
    return this.testDataGenerator;
  }

  /**
   * Get test data cleanup
   */
  getTestDataCleanup(): TestDataCleanup {
    return this.testDataCleanup;
  }

  /**
   * Create a conversation in the database for testing
   */
  async createTestConversation(page: Page, title: string): Promise<string> {
    // Create conversation via API endpoint
    const response = await page.request.post('http://localhost:3000/api/conversations', {
      data: {
        title: title,
        user_id: 'test-user',
        metadata: {
          testRun: this.testDataGenerator.getTestRunId()
        }
      }
    });

    if (!response.ok()) {
      throw new Error(`Failed to create test conversation: ${response.status()}`);
    }

    const conversation = await response.json();
    const conversationId = conversation.id as string;

    // Readiness poll: ensure conversation is queryable before navigation
    const start = Date.now();
    const timeoutMs = 1500;
    while (Date.now() - start < timeoutMs) {
      try {
        const check = await page.request.get(`http://localhost:3000/api/conversations/${conversationId}`);
        if (check.ok()) {
          break;
        }
      } catch {
        // ignore and retry
      }
      await page.waitForTimeout(150);
    }

    return conversationId;
  }
}

/**
 * Common test utilities
 */
export class TestUtils {
  /**
   * Wait for a message to appear in the chat
   */
  static async waitForMessage(page: Page, content: string, timeout = 10000): Promise<void> {
    await page.waitForSelector(`text=${content}`, { timeout });
  }

  /**
   * Wait for loading indicator to disappear
   */
  static async waitForLoadingToComplete(page: Page, timeout = 30000): Promise<void> {
    // Try to see the spinner appear fast
    try {
      await page.waitForSelector('text=Chef Chopsky is thinking...', { timeout: 2500 });
    } catch {
      // Spinner may not render; fall back to assistant bubble presence shortly
      await page.waitForSelector('[class*="bg-gray-100"]', { timeout: 5000 });
      return;
    }

    // Then wait for spinner to detach with a slightly reduced timeout
    const detachTimeout = Math.min(timeout, 25000);
    await page.waitForSelector('text=Chef Chopsky is thinking...', { state: 'detached', timeout: detachTimeout }).catch(async () => {
      // Fallback: proceed if we see any assistant bubble
      await page.waitForSelector('[class*="bg-gray-100"]', { timeout: 5000 });
    });
  }

  /**
   * Send a message in the chat interface
   */
  static async sendMessage(page: Page, message: string): Promise<void> {
    // Find the message input (textarea in ChatInterface)
    const messageInput = page.locator('textarea').first();
    await expect(messageInput).toBeVisible();
    
    // Type the message
    await messageInput.fill(message);
    
    // Click send button (button with Send icon)
    const sendButton = page.locator('button:has(svg):near(textarea)').first();
    await expect(sendButton).toBeEnabled();
    await sendButton.click();
  }

  /**
   * Wait for toast notification
   */
  static async waitForToast(page: Page, type: 'success' | 'error' | 'warning' | 'info', timeout = 5000): Promise<void> {
    // Look for toasts based on their actual content, not the type word
    let toastSelector: string;
    switch (type) {
      case 'error':
        toastSelector = '[role="alert"]:has-text("Failed to send message"), [role="alert"]:has-text("Connection Error")';
        break;
      case 'success':
        toastSelector = '[role="alert"]:has-text("Message sent successfully")';
        break;
      case 'warning':
        toastSelector = '[role="alert"]:has-text("Retrying")';
        break;
      case 'info':
        toastSelector = '[role="alert"]';
        break;
      default:
        toastSelector = '[role="alert"]';
    }
    await page.waitForSelector(toastSelector, { timeout });
  }

  /**
   * Check if retry button is visible
   */
  static async waitForRetryButton(page: Page, timeout = 5000): Promise<void> {
    await page.waitForSelector('button:has-text("Retry")', { timeout });
  }

  /**
   * Click retry button
   */
  static async clickRetryButton(page: Page): Promise<void> {
    const retryButton = page.locator('button:has-text("Retry")').first();
    await expect(retryButton).toBeVisible();
    await retryButton.click();
  }

  /**
   * Navigate to a conversation
   */
  static async navigateToConversation(page: Page, conversationId: string): Promise<void> {
    await page.goto(`/conversations/${conversationId}`);
    // Prefer explicit a11y/text-based readiness
    await page.waitForSelector('textarea', { timeout: 10000 });
  }

  /**
   * Create a new conversation
   */
  static async createConversation(page: Page, title: string): Promise<string> {
    // Click create conversation button
    const createButton = page.locator('button:has-text("New Conversation")').first();
    await expect(createButton).toBeVisible();
    await createButton.click();
    
    // Wait for modal to appear
    await page.waitForSelector('text=Start New Conversation', { timeout: 5000 });
    
    // Fill in conversation title
    const titleInput = page.locator('input[id="title"]').first();
    await expect(titleInput).toBeVisible();
    await titleInput.fill(title);
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // Wait for navigation to conversation page
    await page.waitForURL(/\/conversations\/[a-f0-9-]+/, { timeout: 10000 });
    
    // Extract conversation ID from URL
    const url = page.url();
    const match = url.match(/\/conversations\/([a-f0-9-]+)/);
    if (!match) {
      throw new Error('Could not extract conversation ID from URL');
    }
    
    return match[1];
  }
}
