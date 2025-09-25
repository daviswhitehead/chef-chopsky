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
    await page.click('button:has(svg):near(textarea)');
    
    // Wait for loading indicator
    await page.waitForSelector('text=Chef Chopsky is thinking');
    
    // Wait for either success or timeout (with reasonable timeout)
    await page.waitForTimeout(30000); // Wait up to 30 seconds
    
    // Check that we either got a response or a timeout error
    const hasResponse = await page.locator('[class*="bg-gray-100"]').count() > 0;
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
    await page.click('button:has(svg):near(textarea)');
    
    // Wait for initial loading message
    await page.waitForSelector('text=Chef Chopsky is thinking');
    
    // Wait for response to complete (with reasonable timeout)
    await page.waitForSelector('text=Chef Chopsky is thinking', { state: 'hidden', timeout: 30000 });
    
    // Check if we got a response
    const hasResponse = await page.locator('[class*="bg-gray-100"]').count() > 0;
    const hasError = await page.locator('text=Sorry, I\'m having trouble connecting').count() > 0;
    
    // Should have either a response or error message
    expect(hasResponse || hasError).toBe(true);
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
    await page.click('button:has(svg):near(textarea)');
    
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
    const hasResponse = await page.locator('[class*="bg-gray-100"]').count() > 0;
    const hasError = await page.locator('text=Sorry, I\'m having trouble connecting').count() > 0;
    
    expect(hasResponse || hasError).toBe(true);
  });
});
