import { test, expect } from '@playwright/test';
import { ChatPage } from '../pages/chat-page';
import { APIHelpers } from '../utils/test-helpers';
import { TEST_CONFIG } from '../fixtures/test-config';

test.describe('LangSmith Integration Tests', () => {
  let chatPage: ChatPage;
  let apiHelpers: APIHelpers;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    apiHelpers = new APIHelpers(TEST_CONFIG.BASE_URL);
    
    await chatPage.goto();
    await chatPage.waitForPageLoad();
  });

  test('Messages are correctly traced in LangSmith', async ({ page }) => {
    // Create conversation and send message
    await chatPage.createNewConversation();
    const testMessage = TEST_CONFIG.TEST_MESSAGES.SIMPLE;
    await chatPage.sendMessage(testMessage);
    await chatPage.waitForAIResponse();

    // Wait for LangSmith sync
    await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.LANGSMITH_SYNC);

    // Test LangSmith integration via API
    const langsmithTest = await apiHelpers.testLangSmithAPI();
    
    // Validate test results
    expect(langsmithTest.success).toBe(true);
    expect(langsmithTest.tests.totalTests).toBeGreaterThan(0);
    expect(langsmithTest.tests.passedTests).toBeGreaterThan(0);
    expect(langsmithTest.tests.failedTests).toBe(0);

    // Check specific test results
    const testResults = langsmithTest.tests.results;
    const connectionTest = testResults.find((test: any) => test.testName === 'LangSmith Connection');
    expect(connectionTest?.passed).toBe(true);

    const loggingTest = testResults.find((test: any) => test.testName === 'Conversation Logging');
    expect(loggingTest?.passed).toBe(true);

    const runCompletionTest = testResults.find((test: any) => test.testName === 'Run Completion');
    expect(runCompletionTest?.passed).toBe(true);
  });

  test('LangSmith data accuracy validation', async ({ page }) => {
    // Send multiple test messages
    await chatPage.createNewConversation();
    
    const messages = [
      TEST_CONFIG.TEST_MESSAGES.SIMPLE,
      TEST_CONFIG.TEST_MESSAGES.MEAL_PLANNING,
      TEST_CONFIG.TEST_MESSAGES.COOKING_HELP
    ];

    for (const message of messages) {
      await chatPage.sendMessage(message);
      await chatPage.waitForAIResponse();
      await page.waitForTimeout(1000); // Brief pause between messages
    }

    // Wait for all LangSmith syncs
    await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.LANGSMITH_SYNC * 2);

    // Test LangSmith integration
    const langsmithTest = await apiHelpers.testLangSmithAPI();
    
    // Validate comprehensive test results
    expect(langsmithTest.success).toBe(true);
    expect(langsmithTest.tests.passedTests).toBeGreaterThan(0);
    
    // Check monitoring data
    if (langsmithTest.monitoring) {
      expect(langsmithTest.monitoring.recentRuns).toBeDefined();
      expect(langsmithTest.monitoring.projectStats).toBeDefined();
      
      // Verify recent runs exist
      if (langsmithTest.monitoring.recentRuns.length > 0) {
        const recentRun = langsmithTest.monitoring.recentRuns[0];
        expect(recentRun.id).toBeDefined();
        expect(recentRun.status).toBeDefined();
      }
    }
  });

  test('LangSmith connection and authentication', async ({ page }) => {
    // Test LangSmith connection without sending messages
    const langsmithTest = await apiHelpers.testLangSmithAPI();
    
    // Validate connection
    expect(langsmithTest.success).toBe(true);
    
    // Check that connection test passed
    const connectionTest = langsmithTest.tests.results.find(
      (test: any) => test.testName === 'LangSmith Connection'
    );
    expect(connectionTest?.passed).toBe(true);
    expect(connectionTest?.error).toBeUndefined();
  });

  test('LangSmith project access and configuration', async ({ page }) => {
    const langsmithTest = await apiHelpers.testLangSmithAPI();
    
    expect(langsmithTest.success).toBe(true);
    
    // Check project access test
    const projectTest = langsmithTest.tests.results.find(
      (test: any) => test.testName === 'Project Access'
    );
    expect(projectTest?.passed).toBe(true);
    
    // Verify project configuration
    if (langsmithTest.monitoring?.projectStats) {
      const stats = langsmithTest.monitoring.projectStats;
      expect(stats.projectName).toBeDefined();
      expect(stats.totalRuns).toBeGreaterThanOrEqual(0);
    }
  });

  test('LangSmith error handling', async ({ page }) => {
    // Test error handling by checking error test results
    const langsmithTest = await apiHelpers.testLangSmithAPI();
    
    expect(langsmithTest.success).toBe(true);
    
    // Check error handling test
    const errorTest = langsmithTest.tests.results.find(
      (test: any) => test.testName === 'Error Handling'
    );
    expect(errorTest?.passed).toBe(true);
  });

  test('LangSmith run retrieval and validation', async ({ page }) => {
    // Send a message to create a run
    await chatPage.createNewConversation();
    await chatPage.sendMessage(TEST_CONFIG.TEST_MESSAGES.SIMPLE);
    await chatPage.waitForAIResponse();
    
    // Wait for LangSmith sync
    await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.LANGSMITH_SYNC);

    // Test run retrieval
    const langsmithTest = await apiHelpers.testLangSmithAPI();
    
    expect(langsmithTest.success).toBe(true);
    
    // Check run retrieval test
    const retrievalTest = langsmithTest.tests.results.find(
      (test: any) => test.testName === 'Run Retrieval'
    );
    expect(retrievalTest?.passed).toBe(true);
    
    // Verify we can retrieve recent runs
    if (langsmithTest.monitoring?.recentRuns) {
      expect(langsmithTest.monitoring.recentRuns.length).toBeGreaterThan(0);
      
      const recentRun = langsmithTest.monitoring.recentRuns[0];
      expect(recentRun.id).toBeDefined();
      expect(recentRun.status).toBeDefined();
      expect(recentRun.startTime).toBeDefined();
    }
  });

  test('LangSmith performance metrics', async ({ page }) => {
    const startTime = Date.now();
    
    // Send message and measure response time
    await chatPage.createNewConversation();
    await chatPage.sendMessage(TEST_CONFIG.TEST_MESSAGES.SIMPLE);
    await chatPage.waitForAIResponse();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Wait for LangSmith sync
    await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.LANGSMITH_SYNC);

    // Validate performance metrics
    expect(responseTime).toBeLessThan(TEST_CONFIG.TIMEOUTS.OPENAI_RESPONSE);
    
    // Test LangSmith integration
    const langsmithTest = await apiHelpers.testLangSmithAPI();
    expect(langsmithTest.success).toBe(true);
    
    // Check if performance metrics are recorded
    if (langsmithTest.monitoring?.recentRuns) {
      const recentRun = langsmithTest.monitoring.recentRuns[0];
      expect(recentRun.startTime).toBeDefined();
      expect(recentRun.endTime).toBeDefined();
    }
  });
});
