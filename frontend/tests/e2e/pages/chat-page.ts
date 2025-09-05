import { Page, Locator, expect } from '@playwright/test';
import { TEST_CONFIG } from '../fixtures/test-config';

/**
 * Page Object Model for the Chat Interface
 */
export class ChatPage {
  // Page elements
  readonly page: Page;
  readonly conversationList: Locator;
  readonly newConversationButton: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly loadingIndicator: Locator;
  readonly aiResponse: Locator;
  readonly userMessage: Locator;
  readonly conversationTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.conversationList = page.locator('[data-testid="conversation-list"]');
    this.newConversationButton = page.locator('[data-testid="new-conversation-button"]');
    this.messageInput = page.locator('[data-testid="message-input"]');
    this.sendButton = page.locator('[data-testid="send-button"]');
    this.loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    this.aiResponse = page.locator('[data-testid="ai-response"]');
    this.userMessage = page.locator('[data-testid="user-message"]');
    this.conversationTitle = page.locator('[data-testid="conversation-title"]');
  }

  /**
   * Navigate to the main chat page
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.conversationList.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUTS.PAGE_LOAD });
  }

  /**
   * Create a new conversation
   */
  async createNewConversation(): Promise<void> {
    await this.newConversationButton.click();
    await this.page.waitForTimeout(1000); // Wait for UI update
  }

  /**
   * Send a message through the chat interface
   */
  async sendMessage(message: string): Promise<void> {
    await this.messageInput.fill(message);
    await this.sendButton.click();
    
    // Wait for the message to appear in the chat
    await this.page.waitForSelector(`text=${message}`, { timeout: 5000 });
  }

  /**
   * Wait for AI response to complete
   */
  async waitForAIResponse(timeout = TEST_CONFIG.TIMEOUTS.OPENAI_RESPONSE): Promise<void> {
    // Wait for loading indicator to disappear
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout });
    
    // Wait for AI response to appear
    await this.aiResponse.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get the last AI response
   */
  async getLastAIResponse(): Promise<string> {
    const responses = await this.aiResponse.all();
    if (responses.length === 0) {
      throw new Error('No AI responses found');
    }
    const lastResponse = responses[responses.length - 1];
    return await lastResponse.textContent() || '';
  }

  /**
   * Get all messages in the current conversation
   */
  async getAllMessages(): Promise<Array<{ role: string; content: string; timestamp?: string }>> {
    const messages = await this.page.locator('[data-testid="message"]').all();
    const result = [];
    
    for (const message of messages) {
      const role = await message.getAttribute('data-role') || 'unknown';
      const content = await message.textContent() || '';
      const timestamp = await message.getAttribute('data-timestamp') || undefined;
      result.push({ role, content, timestamp });
    }
    
    return result;
  }

  /**
   * Get conversation list
   */
  async getConversationList(): Promise<Array<{ id: string; title: string; lastMessage?: string }>> {
    const conversations = await this.page.locator('[data-testid="conversation-item"]').all();
    const result = [];
    
    for (const conversation of conversations) {
      const id = await conversation.getAttribute('data-conversation-id') || '';
      const title = await conversation.locator('[data-testid="conversation-title"]').textContent() || '';
      const lastMessage = await conversation.locator('[data-testid="conversation-last-message"]').textContent() || undefined;
      result.push({ id, title, lastMessage });
    }
    
    return result;
  }

  /**
   * Click on a specific conversation
   */
  async clickConversation(conversationId: string): Promise<void> {
    const conversation = this.page.locator(`[data-conversation-id="${conversationId}"]`);
    await conversation.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to a specific conversation by ID
   */
  async navigateToConversation(conversationId: string): Promise<void> {
    await this.page.goto(`/conversations/${conversationId}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if the conversation list is visible
   */
  async isConversationListVisible(): Promise<boolean> {
    return await this.conversationList.isVisible();
  }

  /**
   * Check if the message input is enabled
   */
  async isMessageInputEnabled(): Promise<boolean> {
    return await this.messageInput.isEnabled();
  }

  /**
   * Check if the send button is enabled
   */
  async isSendButtonEnabled(): Promise<boolean> {
    return await this.sendButton.isEnabled();
  }

  /**
   * Check if loading indicator is visible
   */
  async isLoadingIndicatorVisible(): Promise<boolean> {
    return await this.loadingIndicator.isVisible();
  }

  /**
   * Get the current conversation title
   */
  async getCurrentConversationTitle(): Promise<string> {
    return await this.conversationTitle.textContent() || '';
  }

  /**
   * Validate that the page is in the expected state
   */
  async validatePageState(): Promise<void> {
    expect(await this.isConversationListVisible()).toBe(true);
    expect(await this.isMessageInputEnabled()).toBe(true);
    expect(await this.isSendButtonEnabled()).toBe(true);
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `tests/e2e/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}
