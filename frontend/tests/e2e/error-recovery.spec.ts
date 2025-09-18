import { test, expect } from '@playwright/test';
import { TestEnvironment } from './fixtures/setup';
import { TestUtils } from './fixtures/setup';
import { TEST_SCENARIOS } from './fixtures/test-data';

test.describe('Error Recovery and Retry Mechanisms', () => {
  let testEnv: TestEnvironment;

  test.beforeEach(async ({ page }) => {
    testEnv = new TestEnvironment();
    await testEnv.setup(page);
  });

  test.afterEach(async () => {
    await testEnv.cleanup();
  });

  test('agent service down - error handling and recovery', async ({ page }) => {
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();

    // Create conversation
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();

    // Stop agent service (simulate by returning 500 error from frontend API route)
    await page.route('**/api/ai/chat', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Internal Server Error', 
          message: 'Agent service temporarily unavailable' 
        }),
      });
    });

    // Send message
    await TestUtils.sendMessage(page, TEST_SCENARIOS.SIMPLE_MESSAGE);

    // Wait for error handling
    await page.waitForTimeout(2000);

    // Verify error toast appears
    await TestUtils.waitForToast(page, 'error');

    // Verify error message appears in chat
    const errorMessage = page.locator('[class*="bg-red-50"]:has-text("trouble connecting")');
    await expect(errorMessage).toBeVisible();

    // Verify retry button is present
    await TestUtils.waitForRetryButton(page);

    // Restore agent service (modify route to return success)
    await page.route('**/api/ai/chat', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: 'Based on your question about dinner, I suggest making a simple pasta with vegetables or a quick stir-fry. Both are healthy options that can be prepared quickly.',
          model: 'openai/gpt-5-nano',
          usage: { total_tokens: 50 }
        }),
      });
    });

    // Click retry button
    await TestUtils.clickRetryButton(page);
    
    // Wait for loading indicator to disappear
    await page.waitForSelector('text=Chef Chopsky is thinking...', { state: 'detached', timeout: 30000 });

    // Verify success toast appears
    await TestUtils.waitForToast(page, 'success');

    // Verify assistant response appears
    await page.waitForSelector('[class*="bg-gray-100"]:has-text("dinner")', { timeout: 30000 });

    console.log('✅ Error recovery test completed successfully');
  });

  test('network timeout - automatic retry mechanism', async ({ page }) => {
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();

    // Create conversation
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();

    // Simulate server error (5xx) to trigger retry mechanism
    await page.route('**/api/ai/chat', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Internal Server Error', 
          message: 'Temporary server issue' 
        }),
      });
    });

    // Send message
    await TestUtils.sendMessage(page, TEST_SCENARIOS.SIMPLE_MESSAGE);

    // Wait for retry mechanism to kick in
    await page.waitForTimeout(5000);

    // Verify warning toast appears (retry in progress)
    await TestUtils.waitForToast(page, 'warning');

    // Restore normal response
    await page.unroute('**/api/ai/chat');

    console.log('✅ Network timeout retry test completed successfully');
  });

  test('invalid response - graceful error handling', async ({ page }) => {
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();

    // Create conversation
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();

    // Mock invalid response from frontend API route
    await page.route('**/api/ai/chat', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Invalid response', 
          message: 'Agent service returned unexpected response format' 
        }),
      });
    });

    // Send message
    await TestUtils.sendMessage(page, TEST_SCENARIOS.SIMPLE_MESSAGE);

    // Wait for error handling
    await page.waitForTimeout(2000);

    // Verify error toast appears
    await TestUtils.waitForToast(page, 'error');

    // Verify error message appears in chat
    const errorMessage = page.locator('[class*="bg-red-50"]:has-text("trouble connecting")');
    await expect(errorMessage).toBeVisible();

    console.log('✅ Invalid response test completed successfully');
  });

  test('empty message - validation error', async ({ page }) => {
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();

    // Create conversation
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();

    // Try to send empty message
    const messageInput = page.locator('textarea').first();
    await expect(messageInput).toBeVisible();
    
    // Send button should be disabled for empty message
    const sendButton = page.locator('button:has(svg):near(textarea)').first();
    await expect(sendButton).toBeDisabled();

    // Try to send whitespace-only message
    await messageInput.fill('   ');
    await expect(sendButton).toBeDisabled();

    // Send valid message
    await messageInput.fill(TEST_SCENARIOS.SIMPLE_MESSAGE);
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Verify normal flow works
    await TestUtils.waitForLoadingToComplete(page);
    await TestUtils.waitForToast(page, 'success');

    console.log('✅ Empty message validation test completed successfully');
  });
});
