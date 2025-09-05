import { Page, expect } from '@playwright/test';
import { TEST_CONFIG } from '../fixtures/test-config';

/**
 * Test helper utilities for E2E tests
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for OpenAI response to complete
   */
  async waitForOpenAIResponse(timeout = TEST_CONFIG.TIMEOUTS.OPENAI_RESPONSE): Promise<void> {
    // Wait for the loading indicator to disappear
    await this.page.waitForSelector('[data-testid="loading-indicator"]', { 
      state: 'hidden', 
      timeout 
    });
    
    // Wait for the response to appear
    await this.page.waitForSelector('[data-testid="ai-response"]', { 
      state: 'visible', 
      timeout: 5000 
    });
  }

  /**
   * Send a message through the chat interface
   */
  async sendMessage(message: string): Promise<void> {
    // Type the message
    await this.page.fill('[data-testid="message-input"]', message);
    
    // Click send button
    await this.page.click('[data-testid="send-button"]');
    
    // Wait for the message to appear in chat
    await this.page.waitForSelector(`text=${message}`, { timeout: 5000 });
  }

  /**
   * Create a new conversation
   */
  async createNewConversation(): Promise<void> {
    await this.page.click('[data-testid="new-conversation-button"]');
    
    // Wait for new conversation to be created
    await this.page.waitForSelector('[data-testid="conversation-list"]', { timeout: 5000 });
  }

  /**
   * Navigate to a specific conversation
   */
  async navigateToConversation(conversationId: string): Promise<void> {
    await this.page.goto(`/conversations/${conversationId}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get conversation list from the page
   */
  async getConversationList(): Promise<string[]> {
    const conversations = await this.page.locator('[data-testid="conversation-item"]').all();
    return Promise.all(conversations.map(conv => conv.textContent() || ''));
  }

  /**
   * Get the last AI response from the chat
   */
  async getLastAIResponse(): Promise<string> {
    const responses = await this.page.locator('[data-testid="ai-response"]').all();
    if (responses.length === 0) {
      throw new Error('No AI responses found');
    }
    const lastResponse = responses[responses.length - 1];
    return await lastResponse.textContent() || '';
  }

  /**
   * Get all messages in the current conversation
   */
  async getAllMessages(): Promise<Array<{ role: string; content: string }>> {
    const messages = await this.page.locator('[data-testid="message"]').all();
    const result = [];
    
    for (const message of messages) {
      const role = await message.getAttribute('data-role') || 'unknown';
      const content = await message.textContent() || '';
      result.push({ role, content });
    }
    
    return result;
  }

  /**
   * Wait for LangSmith sync to complete
   */
  async waitForLangSmithSync(timeout = TEST_CONFIG.TIMEOUTS.LANGSMITH_SYNC): Promise<void> {
    // Wait a bit for LangSmith to process
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Wait for Supabase sync to complete
   */
  async waitForSupabaseSync(timeout = TEST_CONFIG.TIMEOUTS.SUPABASE_SYNC): Promise<void> {
    // Wait a bit for Supabase to process
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Validate AI response quality
   */
  async validateAIResponse(response: string): Promise<void> {
    expect(response.length).toBeGreaterThan(TEST_CONFIG.EXPECTED_RESPONSES.MIN_LENGTH);
    expect(response.length).toBeLessThan(TEST_CONFIG.EXPECTED_RESPONSES.MAX_LENGTH);
    
    // Check if response contains expected greeting
    const hasGreeting = TEST_CONFIG.EXPECTED_RESPONSES.CONTAINS_GREETING.some(
      greeting => response.toLowerCase().includes(greeting)
    );
    expect(hasGreeting).toBe(true);
  }

  /**
   * Clean up test data
   */
  async cleanupTestData(): Promise<void> {
    if (TEST_CONFIG.CLEANUP.DELETE_TEST_CONVERSATIONS) {
      // This would need to be implemented based on your API
      // For now, we'll just log that cleanup is needed
      console.log('Test data cleanup needed - implement based on your API');
    }
  }

  /**
   * Take a screenshot for debugging
   */
  async takeDebugScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `tests/e2e/debug-screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}

/**
 * API test helpers for direct API testing
 */
export class APIHelpers {
  constructor(private baseURL: string) {}

  /**
   * Send a message via API
   */
  async sendMessageAPI(conversationId: string, message: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get conversation data from API
   */
  async getConversationAPI(conversationId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/conversations/${conversationId}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Test LangSmith integration via API
   */
  async testLangSmithAPI(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/test/langsmith`);
    
    if (!response.ok) {
      throw new Error(`LangSmith API test failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Test Supabase integration via API
   */
  async testSupabaseAPI(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/test/supabase`);
    
    if (!response.ok) {
      throw new Error(`Supabase API test failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}
