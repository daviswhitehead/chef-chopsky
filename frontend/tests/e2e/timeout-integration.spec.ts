import { test, expect } from '@playwright/test';
import { TestEnvironment } from './fixtures/setup';
import { TestUtils } from './fixtures/setup';

test.describe('Timeout Integration Tests', () => {
  let testEnv: TestEnvironment;

  test.beforeEach(async ({ page }) => {
    testEnv = new TestEnvironment();
    await testEnv.setup(page);
  });

  test.afterEach(async () => {
    await testEnv.cleanup();
  });

  test('should handle agent service timeout gracefully', async ({ page }) => {
    // Create a conversation first
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();
    
    await page.goto(`/conversations/${conversationId}`);
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Send a message that might cause timeout
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', 'Create a very detailed meal plan with extensive nutritional analysis and multiple recipe variations.');
    await page.click('button[type="button"]:has-text("Send")');
    
    // Wait for loading indicator
    await page.waitForSelector('text=Chef Chopsky is thinking');
    
    // Wait for either success or timeout
    await page.waitForTimeout(100000); // Wait up to 100 seconds
    
    // Check that we either got a response or a timeout error
    const hasResponse = await page.locator('[data-testid="assistant-message"]').count() > 0;
    const hasError = await page.locator('text=Sorry, I\'m having trouble connecting').count() > 0;
    const hasRetry = await page.locator('button:has-text("Retry")').count() > 0;
    
    // Should have either a response, error message, or retry button
    expect(hasResponse || hasError || hasRetry).toBe(true);
  });

  test('should show appropriate loading messages for different durations', async ({ page }) => {
    // Create a conversation first
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();
    
    await page.goto(`/conversations/${conversationId}`);
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Send a complex request
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', 'Create a comprehensive meal plan for the week with detailed recipes, shopping lists, and prep instructions.');
    await page.click('button[type="button"]:has-text("Send")');
    
    // Wait for initial loading message
    await page.waitForSelector('text=Chef Chopsky is thinking');
    
    // Wait for potential message change (after 30 seconds)
    await page.waitForTimeout(35000);
    
    // Check if message changed to indicate complex request
    const loadingText = await page.locator('text=Chef Chopsky is working on a complex request').count();
    const stillThinking = await page.locator('text=Chef Chopsky is thinking').count();
    
    // Should either show complex request message or still be thinking
    expect(loadingText > 0 || stillThinking > 0).toBe(true);
  });

  test('should handle network errors during long requests', async ({ page }) => {
    // Create a conversation first
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();
    
    await page.goto(`/conversations/${conversationId}`);
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Send a message
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', 'Create a meal plan');
    await page.click('button[type="button"]:has-text("Send")');
    
    // Wait for loading to start
    await page.waitForSelector('text=Chef Chopsky is thinking');
    
    // Simulate network interruption by going offline
    await page.context().setOffline(true);
    
    // Wait a bit
    await page.waitForTimeout(5000);
    
    // Go back online
    await page.context().setOffline(false);
    
    // Wait for either recovery or error
    await page.waitForTimeout(10000);
    
    // Should either recover or show error
    const hasResponse = await page.locator('[data-testid="assistant-message"]').count() > 0;
    const hasError = await page.locator('text=Sorry, I\'m having trouble connecting').count() > 0;
    
    expect(hasResponse || hasError).toBe(true);
  });
});
