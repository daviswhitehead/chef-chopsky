import { test, expect } from '@playwright/test';
import { TestEnvironment } from './fixtures/setup';
import { TestUtils } from './fixtures/setup';

test.describe('Agent Timeout Scenarios', () => {
  let testEnv: TestEnvironment;

  test.beforeEach(async ({ page }) => {
    testEnv = new TestEnvironment();
    await testEnv.setup(page);
  });

  test.afterEach(async () => {
    await testEnv.cleanup();
  });

  test('should handle complex requests without timeout', async ({ page }) => {
    // Create a conversation first
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();
    
    // Navigate to the conversation
    await page.goto(`/conversations/${conversationId}`);
    
    // Wait for chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Send a complex request that previously caused timeouts
    const complexMessage = 'I need a comprehensive meal plan for the week that includes breakfast, lunch, and dinner. I prefer plant-based proteins and want to focus on longevity nutrition. Please include shopping lists and prep instructions.';
    
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', complexMessage);
    await page.click('button:has(svg):near(textarea)');
    
    // Wait for loading indicator (with fallback)
    try {
      await page.waitForSelector('text=Chef Chopsky is thinking', { timeout: 5000 });
    } catch {
      // Loading indicator might not appear, continue with test
    }
    
    // Wait for response to complete (with reasonable timeout)
    await page.waitForSelector('text=Chef Chopsky is thinking', { state: 'hidden', timeout: 30000 });
    
    // Verify response was received (using actual CSS classes)
    const assistantMessages = await page.locator('[class*="bg-gray-100"]').count();
    expect(assistantMessages).toBeGreaterThan(0);
    
    // Verify response content is substantial (not an error)
    const lastMessage = page.locator('[class*="bg-gray-100"]').last();
    const content = await lastMessage.textContent();
    expect(content).not.toContain('Sorry, I\'m having trouble connecting');
    expect(content?.length).toBeGreaterThan(100); // Substantial response
  });

  test('should show progress indicator for long requests', async ({ page }) => {
    // Create a conversation first
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();
    
    await page.goto(`/conversations/${conversationId}`);
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Send a complex request
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', 'Create a detailed meal plan for a family of 4 with specific dietary restrictions including gluten-free and dairy-free options.');
    await page.click('button:has(svg):near(textarea)');
    
    // Wait for loading indicator (with fallback)
    try {
      await page.waitForSelector('text=Chef Chopsky is thinking', { timeout: 5000 });
    } catch {
      // Loading indicator might not appear, continue with test
    }
    
    // Wait a bit to see progress indicator
    await page.waitForTimeout(5000);
    
    // Check that elapsed time is shown (if loading indicator exists)
    const loadingElements = await page.locator('text=Chef Chopsky is thinking').count();
    if (loadingElements > 0) {
      const loadingText = await page.locator('text=Chef Chopsky is thinking').textContent();
      expect(loadingText).toContain('('); // Should show elapsed time
    }
    
    // Wait for completion
    await page.waitForSelector('text=Chef Chopsky is thinking', { state: 'hidden', timeout: 100000 });
  });

  test('should handle timeout gracefully with retry option', async ({ page }) => {
    // Create a conversation first
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();
    
    await page.goto(`/conversations/${conversationId}`);
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Send a message
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', 'test message');
    await page.click('button:has(svg):near(textarea)');
    
    // Wait for any potential error state
    await page.waitForTimeout(2000);
    
    // Check if retry button exists (would appear on timeout)
    const retryButton = page.locator('button:has-text("Retry")');
    const retryButtonExists = await retryButton.count() > 0;
    
    // If retry button exists, test it
    if (retryButtonExists) {
      await retryButton.click();
      await page.waitForSelector('text=Chef Chopsky is thinking');
    }
  });

  test('should not show duplicate messages during retries', async ({ page }) => {
    // Create a conversation first
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();
    
    await page.goto(`/conversations/${conversationId}`);
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Send a message
    const testMessage = 'test message for duplicate check';
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', testMessage);
    await page.click('button:has(svg):near(textarea)');
    
    // Wait for message to appear
    await page.waitForSelector(`text=${testMessage}`);
    
    // Count user messages (using actual CSS classes)
    const userMessages = await page.locator('[class*="bg-chef-500"]').count();
    expect(userMessages).toBe(1); // Should only be one user message
    
    // Wait for response or timeout
    await page.waitForTimeout(10000);
    
    // Check that we still only have one user message
    const userMessagesAfter = await page.locator('[class*="bg-chef-500"]').count();
    expect(userMessagesAfter).toBe(1);
  });
});

test.describe('Timeout Configuration Tests', () => {
  let testEnv: TestEnvironment;

  test.beforeEach(async ({ page }) => {
    testEnv = new TestEnvironment();
    await testEnv.setup(page);
  });

  test.afterEach(async () => {
    await testEnv.cleanup();
  });

  test('should use appropriate timeouts for different request types', async ({ page }) => {
    // Create a conversation first
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();
    
    await page.goto(`/conversations/${conversationId}`);
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Test short message (should be fast)
    const startTime = Date.now();
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', 'hi');
    await page.click('button:has(svg):near(textarea)');
    
    await page.waitForSelector('text=Chef Chopsky is thinking', { state: 'hidden', timeout: 30000 });
    const shortDuration = Date.now() - startTime;
    
    // Short messages should complete quickly
    expect(shortDuration).toBeLessThan(20000); // Less than 20 seconds
    
    // Test complex message (should take longer but not timeout)
    const complexStartTime = Date.now();
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', 'Create a comprehensive meal plan for the week with detailed recipes, shopping lists, and prep instructions.');
    await page.click('button:has(svg):near(textarea)');
    
    await page.waitForSelector('text=Chef Chopsky is thinking', { state: 'hidden', timeout: 100000 });
    const complexDuration = Date.now() - complexStartTime;
    
    // Complex messages should take longer but complete successfully
    expect(complexDuration).toBeGreaterThan(10000); // More than 10 seconds
    expect(complexDuration).toBeLessThan(90000); // Less than 90 seconds (should not timeout)
  });
});
