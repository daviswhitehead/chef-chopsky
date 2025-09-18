import { test, expect } from '@playwright/test';
import { TestEnvironment } from './fixtures/setup';
import { TestUtils } from './fixtures/setup';
import { TEST_SCENARIOS } from './fixtures/test-data';

test.describe('Simple Chat Tests', () => {
  let testEnv: TestEnvironment;

  test.beforeEach(async ({ page }) => {
    testEnv = new TestEnvironment();
    await testEnv.setup(page);
  });

  test.afterEach(async () => {
    await testEnv.cleanup();
  });

  test('can navigate to home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that main elements are visible
    await expect(page.locator('text=Recent Conversations')).toBeVisible();
    await expect(page.locator('button:has-text("New Conversation")')).toBeVisible();
    
    console.log('✅ Home page navigation test completed successfully');
  });

  test('can navigate directly to conversation page', async ({ page }) => {
    // Create a conversation in the database first
    const conversationId = await testEnv.createTestConversation(page, 'Test Conversation');
    
    // Navigate to the conversation page
    await page.goto(`/conversations/${conversationId}`);
    await page.waitForLoadState('networkidle');

    // Check that we're on a conversation page
    expect(page.url()).toMatch(/\/conversations\/[a-f0-9-]+/);

    // Check for chat interface elements
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();

    const sendButton = page.locator('button.btn-primary').first();
    await expect(sendButton).toBeVisible();

    console.log('✅ Direct conversation navigation test completed successfully');
  });

  test('can send message in existing conversation', async ({ page }) => {
    // Capture console logs for debugging
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    // Create a conversation in the database first
    const conversationId = await testEnv.createTestConversation(page, 'Test Conversation for Messages');
    console.log('Created conversation ID:', conversationId);

    // Wait a moment for the conversation to be fully committed
    await page.waitForTimeout(1000);

    // Navigate to conversation page
    await page.goto(`/conversations/${conversationId}`);
    await page.waitForLoadState('networkidle');

    // Send a message
    const messageInput = page.locator('textarea').first();
    await messageInput.fill(TEST_SCENARIOS.SIMPLE_MESSAGE);

    // Use a more specific selector for the send button (button with Send icon inside ChatInterface)
    // Look for button that's next to the textarea
    const sendButton = page.locator('textarea').locator('..').locator('button:has(svg)').first();
    console.log('Send button found:', await sendButton.count());
    console.log('Send button visible:', await sendButton.isVisible());
    console.log('Send button enabled:', await sendButton.isEnabled());
    console.log('Send button text:', await sendButton.textContent());
    
    await sendButton.click();

    // Wait for the user message to appear first
    console.log('Waiting for user message to appear...');
    await page.waitForSelector(`text=${TEST_SCENARIOS.SIMPLE_MESSAGE}`, { timeout: 10000 });
    console.log('User message appeared');

    // Wait for assistant response to appear (should be the second bubble)
    console.log('Waiting for assistant response...');
    await expect(page.locator('div[class*="max-w-"]').nth(1)).toBeVisible({ timeout: 60000 });
    console.log('Assistant response appeared');

    // Check that the message appears
    await TestUtils.waitForMessage(page, TEST_SCENARIOS.SIMPLE_MESSAGE);

    console.log('✅ Message sending test completed successfully');
  });
});
