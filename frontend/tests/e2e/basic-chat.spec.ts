import { test, expect } from '@playwright/test';
import { Logger } from './fixtures/logger';
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
    await expect(page.getByText('Recent Conversations')).toBeVisible();

    // Check that main elements are visible
    await expect(page.locator('text=Recent Conversations')).toBeVisible();
    await expect(page.locator('button:has-text("New Conversation")')).toBeVisible();
    
    Logger.info('✅ Home page navigation test completed successfully');
  });

  test('can create conversation via modal', async ({ page }) => {
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();

    // Navigate to home page
    await page.goto('/');
    await expect(page.getByText('Recent Conversations')).toBeVisible();

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

    Logger.info('✅ Conversation creation test completed successfully');
  });

  test('can send message in chat interface', async ({ page }) => {
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();

    // Create conversation first
    await page.goto('/');
    await expect(page.getByText('Recent Conversations')).toBeVisible();

    const createButton = page.locator('button:has-text("New Conversation")').first();
    await createButton.click();
    await page.waitForSelector('text=Start New Conversation', { timeout: 5000 });

    const titleInput = page.locator('input[id="title"]').first();
    await titleInput.fill(conversation.title);

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    await page.waitForURL(/\/conversations\/[a-f0-9-]+/, { timeout: 10000 });

    // Enhanced debugging for textarea visibility
    console.log('🔍 Debugging textarea visibility...');
    console.log('Current URL:', page.url());
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check if conversation page loaded properly
    const conversationTitle = page.locator('h1').first();
    const titleVisible = await conversationTitle.isVisible();
    console.log('Conversation title visible:', titleVisible);
    if (titleVisible) {
      const titleText = await conversationTitle.textContent();
      console.log('Conversation title text:', titleText);
    }
    
    // Check for any error messages
    const errorElements = await page.locator('[role="alert"], .error, .text-red-500').all();
    console.log('Error elements found:', errorElements.length);
    for (let i = 0; i < errorElements.length; i++) {
      const errorText = await errorElements[i].textContent();
      console.log(`Error ${i + 1}:`, errorText);
    }
    
    // Check for loading states
    const loadingElements = await page.locator('.animate-spin, [class*="loading"]').all();
    const loadingTextElements = await page.locator('text=Loading').all();
    console.log('Loading elements found:', loadingElements.length + loadingTextElements.length);
    
    // Check console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit for any console errors to accumulate
    await page.waitForTimeout(2000);
    console.log('Console errors:', consoleErrors);
    
    // Check network requests for API failures
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });
    
    // Try to find textarea with multiple strategies
    console.log('🔍 Looking for textarea...');
    
    // Strategy 1: Direct textarea selector
    const textarea1 = page.locator('textarea').first();
    const textarea1Visible = await textarea1.isVisible();
    console.log('Textarea (strategy 1) visible:', textarea1Visible);
    
    // Strategy 2: Textarea in ChatInterface component
    const textarea2 = page.locator('.card textarea').first();
    const textarea2Visible = await textarea2.isVisible();
    console.log('Textarea (strategy 2) visible:', textarea2Visible);
    
    // Strategy 3: Textarea with placeholder
    const textarea3 = page.locator('textarea[placeholder*="Chef Chopsky"]').first();
    const textarea3Visible = await textarea3.isVisible();
    console.log('Textarea (strategy 3) visible:', textarea3Visible);
    
    // Strategy 4: Any textarea anywhere
    const allTextareas = await page.locator('textarea').all();
    console.log('Total textareas found:', allTextareas.length);
    for (let i = 0; i < allTextareas.length; i++) {
      const visible = await allTextareas[i].isVisible();
      const placeholder = await allTextareas[i].getAttribute('placeholder');
      console.log(`Textarea ${i + 1}: visible=${visible}, placeholder="${placeholder}"`);
    }
    
    // Check if ChatInterface component is rendered
    const chatInterface = page.locator('.card').first();
    const chatInterfaceVisible = await chatInterface.isVisible();
    console.log('ChatInterface card visible:', chatInterfaceVisible);
    if (chatInterfaceVisible) {
      const cardContent = await chatInterface.textContent();
      console.log('ChatInterface card content preview:', cardContent?.substring(0, 200));
    }
    
    // Check for conversation not found state
    const notFoundText = page.locator('text=Conversation not found');
    const notFoundVisible = await notFoundText.isVisible();
    console.log('Conversation not found visible:', notFoundVisible);
    
    // Log network errors if any
    if (networkErrors.length > 0) {
      console.log('Network errors:', networkErrors);
    }
    
    // Now test sending a message - use the most likely textarea
    const messageInput = page.locator('textarea').first();
    await expect(messageInput).toBeVisible();

    // Type a simple message
    await messageInput.fill(TEST_SCENARIOS.SIMPLE_MESSAGE);

    // Click send button (use more specific selector to avoid clicking wrong button)
    const sendButton = page.locator('button:has(svg):near(textarea)').first();
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Wait for loading indicator (with longer timeout)
    await page.waitForSelector('text=Chef Chopsky is thinking', { timeout: 10000 });

    Logger.info('✅ Message sending test completed successfully');
  });
});
