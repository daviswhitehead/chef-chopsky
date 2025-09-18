import { test, expect } from '@playwright/test';
import { TestEnvironment } from './fixtures/setup';

test.describe('Debug Message Sending', () => {
  let testEnv: TestEnvironment;

  test.beforeEach(async ({ page }) => {
    testEnv = new TestEnvironment();
    await testEnv.setup(page);
  });

  test.afterEach(async () => {
    await testEnv.cleanup();
  });

  test('debug message sending flow', async ({ page }) => {
    // Create a conversation in the database first
    const conversationId = await testEnv.createTestConversation(page, 'Debug Message Test');
    console.log('Created conversation ID:', conversationId);
    
    // Navigate to the conversation page
    await page.goto(`/conversations/${conversationId}`);
    await page.waitForSelector('textarea', { timeout: 10000 });

    // Check that we're on a conversation page
    expect(page.url()).toMatch(/\/conversations\/[a-f0-9-]+/);
    
    // Check if we see "Conversation not found" or the actual conversation
    const notFoundText = page.locator('text=Conversation not found');
    const isNotFound = await notFoundText.isVisible();
    console.log('Conversation not found visible:', isNotFound);

    // Check for chat interface elements
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();

    const sendButton = page.locator('button:has(svg):near(textarea)').first();
    await expect(sendButton).toBeVisible();

    // Try to send a message
    await textarea.fill('Hello, this is a test message');
    
    // Check if send button is enabled
    const isSendButtonEnabled = await sendButton.isEnabled();
    console.log('Send button enabled:', isSendButtonEnabled);
    
    // Click send button
    await sendButton.click();
    
    // Wait a very short time and check what happens
    await page.waitForTimeout(500);
    
    // Check if loading indicator appears
    const loadingIndicator = page.locator('text=Chef Chopsky is thinking...');
    const isLoadingVisible = await loadingIndicator.isVisible();
    console.log('Loading indicator visible:', isLoadingVisible);
    
    // Check if there are any loading-related elements
    const loadingElements = page.locator('[class*="animate-spin"]');
    const loadingCount = await loadingElements.count();
    console.log('Loading elements count:', loadingCount);
    
    // Check if we're still on the same page
    const currentUrl = page.url();
    console.log('Current URL after click:', currentUrl);
    
    // Check if textarea still exists
    const textareaExists = await textarea.count() > 0;
    console.log('Textarea still exists:', textareaExists);
    
    // Check console logs for errors
    const logs = [];
    page.on('console', msg => {
      console.log(`Console ${msg.type()}:`, msg.text());
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    // Wait a bit more and check logs
    await page.waitForTimeout(3000);
    console.log('Console errors:', logs);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-message-sending.png' });
    
    console.log('✅ Message sending debug completed');
  });
});
