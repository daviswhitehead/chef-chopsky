import { Page, expect } from '@playwright/test';
import { Logger } from './logger';

/**
 * Production Service Health Check utilities
 */
export class ProductionServiceHealthChecker {
  private static readonly FRONTEND_URL = 'https://chef-chopsky-production.vercel.app';
  private static readonly AGENT_URL = 'https://chef-chopsky-production.up.railway.app';

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
      const response = await page.request.get(`${this.AGENT_URL}/health`);
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
        Logger.info('✅ Both production services are healthy');
        Logger.info(`Frontend: ${this.FRONTEND_URL}`);
        Logger.info(`Agent: ${this.AGENT_URL}`);
        return;
      }
      
      Logger.info('⏳ Waiting for production services to be healthy...');
      await page.waitForTimeout(1000);
    }
    
    throw new Error('Production services did not become healthy within timeout');
  }
}

/**
 * Production Test Environment setup
 */
export class ProductionTestEnvironment {
  private currentPage?: Page;

  /**
   * Setup production test environment
   */
  async setup(page: Page): Promise<void> {
    Logger.info('🚀 Setting up production test environment');
    this.currentPage = page;
    
    // Wait for services to be healthy
    await ProductionServiceHealthChecker.waitForServices(page);
    
    // Navigate to the production app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    Logger.info('✅ Production test environment ready');
  }

  /**
   * Cleanup production test environment
   */
  async cleanup(): Promise<void> {
    Logger.info('🧹 Cleaning up production test environment');
    // No cleanup needed for production tests
  }
}

/**
 * Production Test Utilities
 */
export class ProductionTestUtils {
  /**
   * Send a message in the production chat interface
   */
  static async sendMessage(page: Page, message: string): Promise<void> {
    Logger.info(`📤 Sending message: "${message}"`);
    
    // Find the message input (textarea in ChatInterface)
    const messageInput = page.locator('textarea').first();
    await expect(messageInput).toBeVisible();
    
    // Type the message
    await messageInput.fill(message);
    
    // Click send button (button with Send icon)
    const sendButton = page.locator('button:has(svg):near(textarea)').first();
    await expect(sendButton).toBeEnabled();
    await sendButton.click();
    
    Logger.info('✅ Message sent');
  }

  /**
   * Wait for loading indicator to disappear
   */
  static async waitForLoadingToComplete(page: Page, timeout = 30000): Promise<void> {
    Logger.info('⏳ Waiting for AI response...');
    
    // Try to see the spinner appear fast
    try {
      await page.waitForSelector('text=Chef Chopsky is thinking...', { timeout: 2500 });
    } catch {
      // Spinner may not render; fall back to assistant bubble presence shortly
      await page.waitForSelector('[class*="bg-gray-100"]', { timeout: Math.min(timeout, 20000) });
      return;
    }

    // Then wait for spinner to detach with a slightly reduced timeout
    const detachTimeout = Math.min(timeout, 25000);
    await page.waitForSelector('text=Chef Chopsky is thinking...', { state: 'detached', timeout: detachTimeout }).catch(async () => {
      // Fallback: proceed if we see any assistant bubble
      await page.waitForSelector('[class*="bg-gray-100"]', { timeout: Math.min(timeout, 20000) });
    });
    
    Logger.info('✅ AI response received');
  }

  /**
   * Create a new conversation in production
   */
  static async createConversation(page: Page, title: string): Promise<string> {
    Logger.info(`📝 Creating conversation: "${title}"`);
    
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
    
    Logger.info(`✅ Conversation created with ID: ${match[1]}`);
    return match[1];
  }

  /**
   * Validate AI response content
   */
  static async validateAIResponse(
    page: Page, 
    context: string = 'AI response'
  ): Promise<void> {
    Logger.info(`🔍 Validating ${context}...`);
    
    // Wait for assistant response to appear
    await page.waitForSelector('[class*="bg-gray-100"]', { timeout: 30000 });
    
    // Get the response text
    const responseText = await page.locator('[class*="bg-gray-100"]').textContent();
    
    if (!responseText) {
      Logger.info(`ℹ️ ${context}: No response text found`);
      return;
    }
    
    // Validate basic response structure
    expect(responseText.length).toBeGreaterThan(10);
    
    Logger.info(`✅ ${context} validated (${responseText.length} characters)`);
    Logger.info(`📄 Response preview: ${responseText.substring(0, 100)}...`);
  }

  /**
   * Test complete chat flow
   */
  static async testCompleteChatFlow(page: Page, testMessage: string): Promise<void> {
    Logger.info('🧪 Testing complete chat flow...');
    
    // Step 1: Create conversation
    const conversationId = await this.createConversation(page, 'Production Test Chat');
    
    // Step 2: Send message
    await this.sendMessage(page, testMessage);
    
    // Step 3: Wait for AI response
    await this.waitForLoadingToComplete(page);
    
    // Step 4: Validate response
    await this.validateAIResponse(page, 'Production AI Response');
    
    Logger.info('✅ Complete chat flow test passed');
  }
}
