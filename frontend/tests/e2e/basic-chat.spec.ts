import { test, expect } from '@playwright/test';
import { TestEnvironment } from './fixtures/setup';
import { TestUtils } from './fixtures/setup';
import { TEST_SCENARIOS } from './fixtures/test-data';

test.describe('Basic Chat Functionality', () => {
  let testEnv: TestEnvironment;

  test.beforeEach(async ({ page }) => {
    testEnv = new TestEnvironment();
    await testEnv.setup(page);
  });

  test.afterEach(async () => {
    await testEnv.cleanup();
  });

  test('can navigate to home page and see UI elements', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that main elements are visible
    await expect(page.locator('text=Recent Conversations')).toBeVisible();
    await expect(page.locator('button:has-text("New Conversation")')).toBeVisible();
    
    console.log('✅ Home page navigation test completed successfully');
  });

  test('can create conversation via modal', async ({ page }) => {
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();

    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click create conversation button
    const createButton = page.locator('button:has-text("New Conversation")').first();
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Wait for modal to appear
    await page.waitForSelector('text=Start New Conversation', { timeout: 5000 });

    // Fill in conversation title
    const titleInput = page.locator('input[id="title"]').first();
    await expect(titleInput).toBeVisible();
    await titleInput.fill(conversation.title);

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Wait for navigation to conversation page
    await page.waitForURL(/\/conversations\/[a-f0-9-]+/, { timeout: 10000 });

    // Verify we're on a conversation page
    expect(page.url()).toMatch(/\/conversations\/[a-f0-9-]+/);

    console.log('✅ Conversation creation test completed successfully');
  });

  test('can send message in chat interface', async ({ page }) => {
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();

    // Create conversation first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const createButton = page.locator('button:has-text("New Conversation")').first();
    await createButton.click();
    await page.waitForSelector('text=Start New Conversation', { timeout: 5000 });

    const titleInput = page.locator('input[id="title"]').first();
    await titleInput.fill(conversation.title);

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    await page.waitForURL(/\/conversations\/[a-f0-9-]+/, { timeout: 10000 });

    // Now test sending a message
    const messageInput = page.locator('textarea').first();
    await expect(messageInput).toBeVisible();

    // Type a simple message
    await messageInput.fill(TEST_SCENARIOS.SIMPLE_MESSAGE);

    // Click send button (use more specific selector to avoid clicking wrong button)
    const sendButton = page.locator('button:has(svg):near(textarea)').first();
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Wait for loading indicator
    await page.waitForSelector('text=Chef Chopsky is thinking...', { timeout: 5000 });

    console.log('✅ Message sending test completed successfully');
  });
});
