import { Page, expect } from '@playwright/test';
import { TestDataGenerator, TestDataCleanup } from './test-data';

/**
 * Service health check utilities
 */
export class ServiceHealthChecker {
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
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const frontendHealthy = await this.checkFrontendHealth(page);
      const agentHealthy = await this.checkAgentHealth(page);
      
      if (frontendHealthy && agentHealthy) {
        console.log('Both services are healthy');
        return;
      }
      
      console.log('Waiting for services to be healthy...');
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

  constructor() {
    this.testDataGenerator = new TestDataGenerator();
    this.testDataCleanup = new TestDataCleanup(this.testDataGenerator.getTestRunId());
  }

  /**
   * Setup test environment before each test
   */
  async setup(page: Page): Promise<void> {
    console.log(`Setting up test environment for run: ${this.testDataGenerator.getTestRunId()}`);
    
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
    console.log(`Cleaning up test environment for run: ${this.testDataGenerator.getTestRunId()}`);
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
    return conversation.id;
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
    // Wait for loading indicator to appear
    await page.waitForSelector('text=Chef Chopsky is thinking...', { timeout: 5000 });
    
    // Wait for loading indicator to disappear
    await page.waitForSelector('text=Chef Chopsky is thinking...', { state: 'detached', timeout });
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
    await page.waitForLoadState('networkidle');
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
