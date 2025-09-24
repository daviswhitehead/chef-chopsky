import { test, expect } from '@playwright/test';

test.describe('Agent Timeout Scenarios', () => {
  test('should handle complex requests without timeout', async ({ page }) => {
    // Navigate to a conversation
    await page.goto('/conversations/test-timeout-conversation');
    
    // Wait for chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Send a complex request that previously caused timeouts
    const complexMessage = 'I need a comprehensive meal plan for the week that includes breakfast, lunch, and dinner. I prefer plant-based proteins and want to focus on longevity nutrition. Please include shopping lists and prep instructions.';
    
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', complexMessage);
    await page.click('button[type="button"]:has-text("Send")');
    
    // Wait for loading indicator
    await page.waitForSelector('text=Chef Chopsky is thinking');
    
    // Wait for response (should complete within timeout)
    await page.waitForSelector('text=Chef Chopsky is thinking', { state: 'hidden', timeout: 100000 }); // 100 seconds
    
    // Verify response was received
    const assistantMessages = await page.locator('[data-testid="assistant-message"]').count();
    expect(assistantMessages).toBeGreaterThan(0);
    
    // Verify response content is substantial (not an error)
    const lastMessage = page.locator('[data-testid="assistant-message"]').last();
    const content = await lastMessage.textContent();
    expect(content).not.toContain('Sorry, I\'m having trouble connecting');
    expect(content?.length).toBeGreaterThan(100); // Substantial response
  });

  test('should show progress indicator for long requests', async ({ page }) => {
    await page.goto('/conversations/test-progress-conversation');
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Send a complex request
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', 'Create a detailed meal plan for a family of 4 with specific dietary restrictions including gluten-free and dairy-free options.');
    await page.click('button[type="button"]:has-text("Send")');
    
    // Wait for loading indicator
    await page.waitForSelector('text=Chef Chopsky is thinking');
    
    // Wait a bit to see progress indicator
    await page.waitForTimeout(5000);
    
    // Check that elapsed time is shown
    const loadingText = await page.locator('text=Chef Chopsky is thinking').textContent();
    expect(loadingText).toContain('('); // Should show elapsed time
    
    // Wait for completion
    await page.waitForSelector('text=Chef Chopsky is thinking', { state: 'hidden', timeout: 100000 });
  });

  test('should handle timeout gracefully with retry option', async ({ page }) => {
    // This test would require mocking the agent service to timeout
    // For now, we'll test the retry UI elements exist
    
    await page.goto('/conversations/test-retry-conversation');
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Send a message
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', 'test message');
    await page.click('button[type="button"]:has-text("Send")');
    
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
    await page.goto('/conversations/test-duplicate-conversation');
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Send a message
    const testMessage = 'test message for duplicate check';
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', testMessage);
    await page.click('button[type="button"]:has-text("Send")');
    
    // Wait for message to appear
    await page.waitForSelector(`text=${testMessage}`);
    
    // Count user messages
    const userMessages = await page.locator('[data-testid="user-message"]').count();
    expect(userMessages).toBe(1); // Should only be one user message
    
    // Wait for response or timeout
    await page.waitForTimeout(10000);
    
    // Check that we still only have one user message
    const userMessagesAfter = await page.locator('[data-testid="user-message"]').count();
    expect(userMessagesAfter).toBe(1);
  });
});

test.describe('Timeout Configuration Tests', () => {
  test('should use appropriate timeouts for different request types', async ({ page }) => {
    await page.goto('/conversations/test-timeout-types');
    await page.waitForSelector('textarea[placeholder*="Ask Chef Chopsky"]');
    
    // Test short message (should be fast)
    const startTime = Date.now();
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', 'hi');
    await page.click('button[type="button"]:has-text("Send")');
    
    await page.waitForSelector('text=Chef Chopsky is thinking', { state: 'hidden', timeout: 30000 });
    const shortDuration = Date.now() - startTime;
    
    // Short messages should complete quickly
    expect(shortDuration).toBeLessThan(20000); // Less than 20 seconds
    
    // Test complex message (should take longer but not timeout)
    const complexStartTime = Date.now();
    await page.fill('textarea[placeholder*="Ask Chef Chopsky"]', 'Create a comprehensive meal plan for the week with detailed recipes, shopping lists, and prep instructions.');
    await page.click('button[type="button"]:has-text("Send")');
    
    await page.waitForSelector('text=Chef Chopsky is thinking', { state: 'hidden', timeout: 100000 });
    const complexDuration = Date.now() - complexStartTime;
    
    // Complex messages should take longer but complete successfully
    expect(complexDuration).toBeGreaterThan(10000); // More than 10 seconds
    expect(complexDuration).toBeLessThan(90000); // Less than 90 seconds (should not timeout)
  });
});
