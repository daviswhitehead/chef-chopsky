import { test, expect } from '@playwright/test';
import { TestEnvironment } from './fixtures/setup';

test.describe('Debug Conversation Page', () => {
  let testEnv: TestEnvironment;

  test.beforeEach(async ({ page }) => {
    testEnv = new TestEnvironment();
    await testEnv.setup(page);
  });

  test.afterEach(async () => {
    await testEnv.cleanup();
  });

  test('debug conversation page content', async ({ page }) => {
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();

    // Navigate to conversation page
    await page.goto(`/conversations/${conversation.id}`);
    await page.waitForSelector('body');

    // Take a screenshot
    await page.screenshot({ path: 'debug-conversation-page.png' });

    // Check what's actually on the page
    const pageContent = await page.content();
    console.log('Conversation page content:', pageContent.substring(0, 2000));

    // Check for any error messages
    const errorElements = await page.locator('text=/error|Error|ERROR/').count();
    console.log('Error elements:', errorElements);

    // Check for any loading indicators
    const loadingElements = await page.locator('text=/loading|Loading|LOADING/').count();
    console.log('Loading elements:', loadingElements);

    // Check for any textarea elements
    const textareaCount = await page.locator('textarea').count();
    console.log('Textarea count:', textareaCount);

    // Check for any button elements
    const buttonCount = await page.locator('button').count();
    console.log('Button count:', buttonCount);

    // Check for any form elements
    const formCount = await page.locator('form').count();
    console.log('Form count:', formCount);

    // Check for any div elements with chat-related classes
    const chatDivs = await page.locator('[class*="chat"]').count();
    console.log('Chat-related divs:', chatDivs);

    // Check the page title
    const title = await page.title();
    console.log('Page title:', title);

    // Check for any console errors
    const logs = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.waitForTimeout(1000);
    console.log('Console logs:', logs);

    console.log('✅ Conversation page debug completed');
  });
});
