/**
 * Test configuration and environment variables for E2E tests
 */

export const TEST_CONFIG = {
  // Base URLs
  BASE_URL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  
  // Test data
  TEST_USER_ID: 'test-user-e2e-123',
  TEST_CONVERSATION_TITLE: 'E2E Test Conversation',
  
  // Test messages
  TEST_MESSAGES: {
    SIMPLE: 'Hello Chef Chopsky! Can you help me plan a simple dinner?',
    MEAL_PLANNING: 'I have kale, sweet potatoes, and chickpeas. What can I make for lunch this week?',
    COOKING_HELP: 'How should I prep kale for a salad?',
    LONG_MESSAGE: 'I need help planning meals for the week. I have a CSA box with kale, sweet potatoes, carrots, and onions. I also have chickpeas, quinoa, and some leftover rice. I want to make 3 different lunch meals that are high in protein and plant-based. Can you help me plan this out?',
  },
  
  // Timeouts (in milliseconds)
  TIMEOUTS: {
    OPENAI_RESPONSE: 30000, // 30 seconds for OpenAI API
    LANGSMITH_SYNC: 5000,   // 5 seconds for LangSmith sync
    SUPABASE_SYNC: 2000,    // 2 seconds for Supabase sync
    UI_INTERACTION: 1000,   // 1 second for UI interactions
    PAGE_LOAD: 10000,       // 10 seconds for page loads
  },
  
  // Expected response patterns
  EXPECTED_RESPONSES: {
    MIN_LENGTH: 50,         // Minimum response length
    MAX_LENGTH: 2000,       // Maximum response length
    CONTAINS_GREETING: ['hello', 'hi', 'hey'], // Expected greeting words
  },
  
  // LangSmith test project
  LANGSMITH_PROJECT: process.env.LANGSMITH_PROJECT || 'chef-chopsky-e2e-tests',
  
  // Supabase test settings
  SUPABASE_TEST_SCHEMA: 'test_schema',
  
  // Test data cleanup
  CLEANUP: {
    DELETE_TEST_CONVERSATIONS: true,
    DELETE_TEST_MESSAGES: true,
    RESET_TEST_DATA: true,
  },
} as const;

export type TestConfig = typeof TEST_CONFIG;
