import { test, expect } from '@playwright/test';
import { ChatPage } from '../pages/chat-page';
import { TestHelpers, APIHelpers } from '../utils/test-helpers';
import { TEST_CONFIG } from '../fixtures/test-config';

test.describe('Complete Conversation Flow', () => {
  let chatPage: ChatPage;
  let testHelpers: TestHelpers;
  let apiHelpers: APIHelpers;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    testHelpers = new TestHelpers(page);
    apiHelpers = new APIHelpers(TEST_CONFIG.BASE_URL);
    
    // Navigate to the main page
    await chatPage.goto();
    await chatPage.waitForPageLoad();
  });

  test('Complete conversation flow with LangSmith tracing', async ({ page }) => {
    // Step 1: Verify page loads correctly
    await chatPage.validatePageState();
    await expect(await chatPage.isConversationListVisible()).toBe(true);

    // Step 2: Create a new conversation
    await chatPage.createNewConversation();
    await page.waitForTimeout(1000); // Wait for UI update

    // Step 3: Send a test message
    const testMessage = TEST_CONFIG.TEST_MESSAGES.SIMPLE;
    await chatPage.sendMessage(testMessage);

    // Step 4: Wait for OpenAI response
    await chatPage.waitForAIResponse();

    // Step 5: Verify response appears in chat
    const aiResponse = await chatPage.getLastAIResponse();
    expect(aiResponse.length).toBeGreaterThan(0);
    
    // Validate AI response quality
    await testHelpers.validateAIResponse(aiResponse);

    // Step 6: Wait for LangSmith sync
    await testHelpers.waitForLangSmithSync();

    // Step 7: Test LangSmith integration via API
    const langsmithTest = await apiHelpers.testLangSmithAPI();
    expect(langsmithTest.success).toBe(true);
    expect(langsmithTest.tests.passedTests).toBeGreaterThan(0);

    // Step 8: Wait for Supabase sync
    await testHelpers.waitForSupabaseSync();

    // Step 9: Verify conversation data persistence
    const messages = await chatPage.getAllMessages();
    expect(messages.length).toBeGreaterThanOrEqual(2); // User message + AI response
    
    // Verify user message is present
    const userMessage = messages.find(msg => msg.role === 'user');
    expect(userMessage).toBeDefined();
    expect(userMessage?.content).toBe(testMessage);
    
    // Verify AI response is present
    const aiMessage = messages.find(msg => msg.role === 'assistant');
    expect(aiMessage).toBeDefined();
    expect(aiMessage?.content).toBe(aiResponse);

    // Step 10: Take screenshot for verification
    await chatPage.takeScreenshot('complete-conversation-flow');
  });

  test('Conversation persists after page refresh', async ({ page }) => {
    // Create conversation and send message
    await chatPage.createNewConversation();
    const testMessage = TEST_CONFIG.TEST_MESSAGES.MEAL_PLANNING;
    await chatPage.sendMessage(testMessage);
    await chatPage.waitForAIResponse();

    // Get conversation ID from URL or page state
    const currentUrl = page.url();
    const conversationId = currentUrl.includes('/conversations/') 
      ? currentUrl.split('/conversations/')[1] 
      : null;

    if (conversationId) {
      // Refresh the page
      await page.reload();
      await chatPage.waitForPageLoad();

      // Verify conversation still exists
      const messages = await chatPage.getAllMessages();
      expect(messages.length).toBeGreaterThanOrEqual(2);
      
      const userMessage = messages.find(msg => msg.role === 'user');
      expect(userMessage?.content).toBe(testMessage);
    }
  });

  test('Multiple messages in same conversation', async ({ page }) => {
    // Create conversation
    await chatPage.createNewConversation();
    
    // Send first message
    await chatPage.sendMessage(TEST_CONFIG.TEST_MESSAGES.SIMPLE);
    await chatPage.waitForAIResponse();
    
    // Send second message
    await chatPage.sendMessage(TEST_CONFIG.TEST_MESSAGES.COOKING_HELP);
    await chatPage.waitForAIResponse();
    
    // Verify both messages and responses are present
    const messages = await chatPage.getAllMessages();
    expect(messages.length).toBeGreaterThanOrEqual(4); // 2 user messages + 2 AI responses
    
    // Verify message order
    const userMessages = messages.filter(msg => msg.role === 'user');
    expect(userMessages.length).toBe(2);
    expect(userMessages[0].content).toBe(TEST_CONFIG.TEST_MESSAGES.SIMPLE);
    expect(userMessages[1].content).toBe(TEST_CONFIG.TEST_MESSAGES.COOKING_HELP);
  });

  test('Error handling for invalid messages', async ({ page }) => {
    await chatPage.createNewConversation();
    
    // Try to send empty message
    await chatPage.messageInput.fill('');
    await expect(chatPage.sendButton).toBeDisabled();
    
    // Try to send very long message
    const longMessage = 'a'.repeat(10000);
    await chatPage.messageInput.fill(longMessage);
    
    // The message should be truncated or rejected
    await chatPage.sendButton.click();
    
    // Wait for either response or error
    try {
      await chatPage.waitForAIResponse(10000); // Shorter timeout
    } catch (error) {
      // Expected - long messages should be rejected
      console.log('Long message was rejected as expected');
    }
  });
});
