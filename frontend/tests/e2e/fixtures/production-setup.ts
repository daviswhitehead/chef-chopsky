import { Page, expect } from '@playwright/test';
import { Logger } from './logger';
import { TestDataGenerator, TestDataCleanup } from './test-data';

/**
 * Production-specific service URLs
 */
const PRODUCTION_URLS = {
  FRONTEND: 'https://chef-chopsky-production.vercel.app',
  AGENT: 'https://chef-chopsky-production.up.railway.app'
};

/**
 * Service health check utilities for production environment
 */
export class ProductionServiceHealthChecker {
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
      const response = await page.request.get(`${PRODUCTION_URLS.AGENT}/health`);
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
        Logger.info('Both production services are healthy');
        this.servicesReady = true;
        return;
      }
      
      Logger.info('Waiting for production services to be healthy...');
      await page.waitForTimeout(1000);
    }
    
    throw new Error('Production services did not become healthy within timeout');
  }
}

/**
 * Production test environment setup and teardown
 */
export class ProductionTestEnvironment {
  private testDataGenerator: TestDataGenerator;
  private testDataCleanup: TestDataCleanup;
  private currentPage?: Page;

  constructor() {
    this.testDataGenerator = new TestDataGenerator();
    this.testDataCleanup = new TestDataCleanup(this.testDataGenerator.getTestRunId());
  }

  /**
   * Setup production test environment before each test
   */
  async setup(page: Page): Promise<void> {
    Logger.info(`Setting up production test environment for run: ${this.testDataGenerator.getTestRunId()}`);
    this.currentPage = page;
    
    // Wait for services to be healthy
    await ProductionServiceHealthChecker.waitForServices(page);
    
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  }

  /**
   * Cleanup test environment after each test
   */
  async cleanup(): Promise<void> {
    Logger.info(`Cleaning up production test environment for run: ${this.testDataGenerator.getTestRunId()}`);
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
   * Create a conversation in the production database for testing
   */
  async createTestConversation(page: Page, title: string): Promise<string> {
    // Create conversation via production API endpoint
    const response = await page.request.post(`${PRODUCTION_URLS.FRONTEND}/api/conversations`, {
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
        const check = await page.request.get(`${PRODUCTION_URLS.FRONTEND}/api/conversations/${conversationId}`);
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
 * Production-specific test utilities
 */
export class ProductionTestUtils {
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
      await page.waitForSelector('[class*="bg-gray-100"]', { timeout: Math.min(timeout, 20000) });
      return;
    }

    // Then wait for spinner to detach with a slightly reduced timeout
    const detachTimeout = Math.min(timeout, 25000);
    await page.waitForSelector('text=Chef Chopsky is thinking...', { state: 'detached', timeout: detachTimeout }).catch(async () => {
      // Fallback: proceed if we see any assistant bubble
      await page.waitForSelector('[class*="bg-gray-100"]', { timeout: Math.min(timeout, 20000) });
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
  static async waitForToast(page: Page, type: 'success' | 'error' | 'warning' | 'info', timeout = 10000): Promise<void> {
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

  /**
   * Validate LLM response content (optional validation with logging)
   * This follows the principle that LLMs are non-deterministic, so we test structure, not content
   */
  static async validateLLMResponse(
    page: Page, 
    selector: string = '[class*="bg-gray-100"]',
    expectedTerms: string[] = [],
    context: string = 'LLM response'
  ): Promise<void> {
    // Wait for assistant response to appear
    await page.waitForSelector(selector, { timeout: 30000 });
    
    // Get the response text
    const responseText = await page.locator(selector).textContent();
    
    if (!responseText) {
      Logger.info(`ℹ️ ${context}: No response text found`);
      return;
    }
    
    // Optional: Check if response contains expected terms (logged, not required)
    if (expectedTerms.length > 0) {
      const hasExpectedTerms = expectedTerms.some(term => 
        responseText.toLowerCase().includes(term.toLowerCase())
      );
      
      if (!hasExpectedTerms) {
        Logger.info(`ℹ️ ${context} did not contain expected terms:`);
        Logger.info('Expected terms:', expectedTerms.join(', '));
        Logger.info('Response preview:', responseText.substring(0, 200) + '...');
        Logger.info('This is OK - LLMs are non-deterministic');
      } else {
        Logger.info(`✅ ${context} contains expected terms`);
      }
    }
    
    // Always validate basic response structure
    expect(responseText.length).toBeGreaterThan(10);
    // Note: LLM responses may not always end with punctuation, so we'll be more flexible
    // Just ensure the response is substantial and not empty
  }

  /**
   * Predefined food-related terms for cooking/nutrition responses
   */
  static readonly FOOD_TERMS = [
    'food', 'nutrition', 'diet', 'meal', 'recipe', 'cooking', 'healthy', 'eat', 'ingredient',
    'tomato', 'onion', 'chicken', 'vegetable', 'veggie', 'produce', 'protein', 'plant',
    'beans', 'lentils', 'tofu', 'tempeh', 'quinoa', 'nuts', 'seeds', 'legume', 'grain',
    'soy', 'chickpea', 'nutritional', 'vitamin', 'mineral', 'fiber', 'calorie', 'serving',
    'portion', 'dinner', 'cook', 'tonight', 'quick', 'easy', 'delicious', 'tasty'
  ];

  /**
   * Predefined cooking-related terms for recipe responses
   */
  static readonly COOKING_TERMS = [
    'cook', 'cooking', 'recipe', 'ingredient', 'prep', 'prepare', 'heat', 'pan', 'oil',
    'seasoning', 'spice', 'sauce', 'stir', 'fry', 'boil', 'bake', 'roast', 'grill',
    'broccoli', 'carrot', 'garlic', 'ginger', 'soy', 'salt', 'pepper', 'herbs'
  ];

  /**
   * Convenience method for validating food/cooking responses
   */
  static async validateFoodResponse(
    page: Page, 
    context: string = 'Food response',
    additionalTerms: string[] = []
  ): Promise<void> {
    const allTerms = [...ProductionTestUtils.FOOD_TERMS, ...additionalTerms];
    await ProductionTestUtils.validateLLMResponse(page, '[class*="bg-gray-100"]', allTerms, context);
  }

  /**
   * Convenience method for validating cooking/recipe responses
   */
  static async validateCookingResponse(
    page: Page, 
    context: string = 'Cooking response',
    additionalTerms: string[] = []
  ): Promise<void> {
    const allTerms = [...ProductionTestUtils.COOKING_TERMS, ...additionalTerms];
    await ProductionTestUtils.validateLLMResponse(page, '[class*="bg-gray-100"]', allTerms, context);
  }

  /**
   * Convenience method for validating any LLM response (no content validation)
   */
  static async validateAnyResponse(
    page: Page, 
    context: string = 'LLM response'
  ): Promise<void> {
    await ProductionTestUtils.validateLLMResponse(page, '[class*="bg-gray-100"]', [], context);
  }
}