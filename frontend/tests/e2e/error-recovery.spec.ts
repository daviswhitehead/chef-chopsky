import { test, expect } from '@playwright/test';
import { Logger } from './fixtures/logger';
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

    // Create conversation first (before setting up any routes)
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();

    // Now set up the error→success mock using retryAttempt flag
    await page.route('**/api/ai/chat', (route, request) => {
      const body = request.postDataJSON();
      const isRetry = body?.retryAttempt > 0;
      
      Logger.info(`Route intercepted: retryAttempt=${body?.retryAttempt}, isRetry=${isRetry}`);
      
      if (isRetry) {
        // Success on retry
        Logger.info('Returning success response on retry');
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: 'Based on your question about dinner, I suggest making a simple pasta with vegetables or a quick stir-fry. Both are healthy options that can be prepared quickly.',
            model: 'openai/gpt-5-nano',
            usage: { total_tokens: 50 }
          }),
        });
      } else {
        // Error on first attempt
        Logger.info('Returning error response on first attempt');
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: 'Internal Server Error', 
            message: 'Agent service temporarily unavailable',
            errorMessage: 'Sorry, I\'m having trouble connecting right now. This might be due to API limits or a temporary issue. Please try again later.'
          }),
        });
      }
    });

    // Send message
    await TestUtils.sendMessage(page, TEST_SCENARIOS.SIMPLE_MESSAGE);

    // Wait for automatic retry to complete
    await TestUtils.waitForLoadingToComplete(page);

    // Verify success message appears (automatic retry succeeded)
    const successMessage = page.locator('[class*="bg-gray-100"]:has-text("dinner")');
    await expect(successMessage).toBeVisible();

    // Test completed - automatic retry succeeded

    Logger.info('✅ Error recovery test completed successfully');
  });

  test('network timeout - automatic retry mechanism', async ({ page }) => {
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();

    // Create conversation first (before setting up any routes)
    const conversationId = await TestUtils.createConversation(page, conversation.title);
    expect(conversationId).toBeTruthy();

    // Now set up the error→success mock using retryAttempt flag for automatic retries
    await page.route('**/api/ai/chat', (route, request) => {
      const body = request.postDataJSON();
      const isRetry = body?.retryAttempt > 0;
      
      if (isRetry) {
        // Success on retry
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: 'I understand you\'re looking for dinner suggestions. Here are some quick and healthy options you can prepare tonight.',
            model: 'openai/gpt-5-nano',
            usage: { total_tokens: 45 }
          }),
        });
      } else {
        // Error on first attempt
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: 'Internal Server Error', 
            message: 'Temporary server issue' 
          }),
        });
      }
    });

    // Send message
    await TestUtils.sendMessage(page, TEST_SCENARIOS.SIMPLE_MESSAGE);

    // Wait for automatic retry mechanism to complete
    await TestUtils.waitForLoadingToComplete(page);

    // Verify assistant response appears (success is indicated by the response)
    await TestUtils.validateFoodResponse(
      page, 
      'Retry success response',
      ['dinner', 'tonight'] // Additional specific terms from the user's message
    );

    Logger.info('✅ Network timeout retry test completed successfully');
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

    Logger.info('✅ Invalid response test completed successfully');
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
    
    // Wait for the button to be properly initialized
    await page.waitForTimeout(1000);
    
    // Clear any existing input first
    await messageInput.clear();
    await page.waitForTimeout(500);
    
    await expect(sendButton).toBeDisabled();

    // Try to send whitespace-only message
    await messageInput.fill('   ');
    await expect(sendButton).toBeDisabled();

    // Send valid message
    await messageInput.fill(TEST_SCENARIOS.SIMPLE_MESSAGE);
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Verify normal flow works - success is indicated by response appearing
    await TestUtils.waitForLoadingToComplete(page);

    Logger.info('✅ Empty message validation test completed successfully');
  });
});
