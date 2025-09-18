// Simple UUID generator for testing (avoiding ES module issues)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface TestConversation {
  id: string;
  userId: string;
  title: string;
  metadata: any;
}

export interface TestMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

/**
 * Generate unique test data for each test run
 */
export class TestDataGenerator {
  private testRunId: string;

  constructor() {
    this.testRunId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateConversation(): TestConversation {
    return {
      id: generateUUID(),
      userId: `test-user-${this.testRunId}`,
      title: `Test Conversation ${this.testRunId}`,
      metadata: {
        csaBox: ['test-tomatoes', 'test-lettuce'],
        dietaryPreferences: ['vegetarian'],
        mealCount: 5,
        prepTime: 60,
      },
    };
  }

  generateUserMessage(conversationId: string, content?: string): TestMessage {
    return {
      id: generateUUID(),
      conversationId,
      role: 'user',
      content: content || `Test message ${this.testRunId}`,
      timestamp: new Date().toISOString(),
    };
  }

  generateAssistantMessage(conversationId: string, content?: string): TestMessage {
    return {
      id: generateUUID(),
      conversationId,
      role: 'assistant',
      content: content || `Test assistant response ${this.testRunId}`,
      timestamp: new Date().toISOString(),
      metadata: {
        model: 'openai/gpt-5-nano',
        usage: { total_tokens: 100 },
      },
    };
  }

  getTestRunId(): string {
    return this.testRunId;
  }
}

/**
 * Test data cleanup utilities
 */
export class TestDataCleanup {
  private testRunId: string;

  constructor(testRunId: string) {
    this.testRunId = testRunId;
  }

  /**
   * Clean up test data from Supabase
   * This would be called after each test to remove test data
   */
  async cleanupTestData(): Promise<void> {
    // Note: In a real implementation, this would connect to Supabase
    // and delete test conversations and messages
    // For now, we'll just log the cleanup action
    console.log(`Cleaning up test data for run: ${this.testRunId}`);
    
    // TODO: Implement actual Supabase cleanup
    // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    // await supabase.from('messages').delete().like('conversation_id', `%${this.testRunId}%`);
    // await supabase.from('conversations').delete().like('user_id', `%${this.testRunId}%`);
  }

  /**
   * Generate cleanup query for manual cleanup if needed
   */
  getCleanupQueries(): string[] {
    return [
      `DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id LIKE '%${this.testRunId}%');`,
      `DELETE FROM conversations WHERE user_id LIKE '%${this.testRunId}%';`,
    ];
  }
}

/**
 * Common test scenarios and data
 */
export const TEST_SCENARIOS = {
  SIMPLE_MESSAGE: 'What should I cook for dinner tonight?',
  COMPLEX_MESSAGE: 'I have tomatoes, onions, and chicken. I want something healthy and quick to make. Any suggestions?',
  ERROR_MESSAGE: 'This is a test message that should trigger an error',
  LONG_MESSAGE: 'I need help planning meals for the entire week. I have a CSA box with seasonal vegetables including kale, carrots, beets, and winter squash. I also have some ground turkey and eggs. I prefer meals that are healthy, family-friendly, and can be prepared in under 45 minutes. Please consider dietary restrictions including no nuts and limited dairy.',
} as const;

/**
 * Expected response patterns for validation
 */
export const EXPECTED_PATTERNS = {
  MEAL_SUGGESTION: /dinner|meal|recipe|cook|ingredient/i,
  ERROR_RESPONSE: /error|unavailable|try again/i,
  LOADING_INDICATOR: /thinking|loading|processing/i,
} as const;
