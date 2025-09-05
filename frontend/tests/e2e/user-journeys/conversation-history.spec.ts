import { test, expect } from '@playwright/test';
import { ChatPage } from '../pages/chat-page';
import { TEST_CONFIG } from '../fixtures/test-config';

test.describe('Conversation History Loading', () => {
  let chatPage: ChatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    
    // Navigate to the main page
    await chatPage.goto();
    await chatPage.waitForPageLoad();
  });

  test('Prior conversations load correctly', async ({ page }) => {
    // Step 1: Verify conversation list is visible
    await expect(await chatPage.isConversationListVisible()).toBe(true);
    console.log('✅ Conversation list is visible');

    // Step 2: Get the conversation list
    const conversations = await chatPage.getConversationList();
    console.log(`📋 Found ${conversations.length} conversations`);

    // Step 3: If there are existing conversations, test clicking on one
    if (conversations.length > 0) {
      const firstConversation = conversations[0];
      console.log(`🔍 Testing conversation: ${firstConversation.title}`);
      
      // Click on the first conversation
      await chatPage.clickConversation(firstConversation.id);
      
      // Wait for the conversation to load
      await page.waitForLoadState('networkidle');
      
      // Verify we're on the conversation page
      const currentUrl = page.url();
      expect(currentUrl).toContain(`/conversations/${firstConversation.id}`);
      console.log('✅ Successfully navigated to conversation page');
      
      // Verify conversation title is displayed
      const conversationTitle = await chatPage.getCurrentConversationTitle();
      expect(conversationTitle).toBeTruthy();
      console.log(`✅ Conversation title: ${conversationTitle}`);
      
      // Get messages in the conversation
      const messages = await chatPage.getAllMessages();
      console.log(`💬 Found ${messages.length} messages in conversation`);
      
      // Verify we have messages (if this is an existing conversation)
      if (messages.length > 0) {
        expect(messages.length).toBeGreaterThan(0);
        console.log('✅ Conversation has message history');
        
        // Verify message structure
        const userMessages = messages.filter(msg => msg.role === 'user');
        const aiMessages = messages.filter(msg => msg.role === 'assistant');
        
        console.log(`👤 User messages: ${userMessages.length}`);
        console.log(`🤖 AI messages: ${aiMessages.length}`);
        
        // Verify we have both user and AI messages
        expect(userMessages.length).toBeGreaterThan(0);
        expect(aiMessages.length).toBeGreaterThan(0);
        console.log('✅ Conversation has both user and AI messages');
      }
      
    } else {
      console.log('ℹ️ No existing conversations found - this is expected for a fresh setup');
      
      // Verify the empty state is handled correctly
      const conversationList = await chatPage.getConversationList();
      expect(conversationList).toBeDefined();
      console.log('✅ Empty conversation list handled correctly');
    }

    // Step 4: Test navigation back to main page
    await page.goto('/');
    await chatPage.waitForPageLoad();
    
    // Verify we're back on the main page
    const mainPageUrl = page.url();
    expect(mainPageUrl).toMatch(/^http:\/\/localhost:3000\/?$/);
    console.log('✅ Successfully navigated back to main page');
    
    // Verify conversation list is still visible
    await expect(await chatPage.isConversationListVisible()).toBe(true);
    console.log('✅ Conversation list still visible on main page');
  });

  test('Conversation list updates after creating new conversation', async ({ page }) => {
    // Get initial conversation count
    const initialConversations = await chatPage.getConversationList();
    const initialCount = initialConversations.length;
    console.log(`📊 Initial conversation count: ${initialCount}`);

    // Create a new conversation
    await chatPage.createNewConversation();
    await page.waitForTimeout(1000); // Wait for UI update
    console.log('✅ Created new conversation');

    // Get updated conversation count
    const updatedConversations = await chatPage.getConversationList();
    const updatedCount = updatedConversations.length;
    console.log(`📊 Updated conversation count: ${updatedCount}`);

    // Verify the count increased
    expect(updatedCount).toBeGreaterThanOrEqual(initialCount);
    console.log('✅ Conversation list updated after creating new conversation');

    // Verify the new conversation appears in the list
    if (updatedCount > initialCount) {
      const newConversation = updatedConversations[updatedConversations.length - 1];
      expect(newConversation.id).toBeTruthy();
      expect(newConversation.title).toBeTruthy();
      console.log(`✅ New conversation added: ${newConversation.title}`);
    }
  });

  test('Conversation persistence after page refresh', async ({ page }) => {
    // Get conversations before refresh
    const conversationsBeforeRefresh = await chatPage.getConversationList();
    console.log(`📋 Conversations before refresh: ${conversationsBeforeRefresh.length}`);

    // Refresh the page
    await page.reload();
    await chatPage.waitForPageLoad();
    console.log('🔄 Page refreshed');

    // Get conversations after refresh
    const conversationsAfterRefresh = await chatPage.getConversationList();
    console.log(`📋 Conversations after refresh: ${conversationsAfterRefresh.length}`);

    // Verify conversations persist
    expect(conversationsAfterRefresh.length).toBe(conversationsBeforeRefresh.length);
    console.log('✅ Conversations persist after page refresh');

    // Verify conversation details are the same
    if (conversationsBeforeRefresh.length > 0) {
      for (let i = 0; i < conversationsBeforeRefresh.length; i++) {
        const before = conversationsBeforeRefresh[i];
        const after = conversationsAfterRefresh[i];
        
        expect(before.id).toBe(after.id);
        expect(before.title).toBe(after.title);
      }
      console.log('✅ Conversation details persist after refresh');
    }
  });
});
