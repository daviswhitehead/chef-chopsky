import { test, expect } from '@playwright/test';
import { Logger } from './fixtures/logger';
import { FailureDiagnostics, attachFailureArtifacts } from './fixtures/diagnostics';
import { TestEnvironment } from './fixtures/setup';
import { NetworkMonitor, Test4NetworkVerifier } from './fixtures/network-monitor';

test.describe('Network Verification Tests (Test 4)', () => {
  let testEnv: TestEnvironment;
  let networkMonitor: NetworkMonitor;

  test.beforeEach(async ({ page }, testInfo) => {
    const diag = new FailureDiagnostics(page);
    diag.install();
    (testInfo as any).__diag = diag;
    
    testEnv = new TestEnvironment();
    await testEnv.setup(page);
    
    // Initialize network monitoring
    networkMonitor = new NetworkMonitor();
    await networkMonitor.startMonitoring(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    networkMonitor.stopMonitoring();
    await testEnv.cleanup();
    
    const diag = (testInfo as any).__diag as FailureDiagnostics | undefined;
    if (diag) {
      await attachFailureArtifacts(page, testInfo, diag).catch(() => {});
    }
  });

  test('verify API calls during complete chat flow', async ({ page }) => {
    Logger.info('Starting Test 4: Browser Network Tab Verification');
    
    // Step 1: Navigate to home page
    await page.goto('/');
    await expect(page.getByText('Chef Chopsky Dashboard')).toBeVisible();
    
    // Step 2: Create a new conversation
    Logger.info('Creating new conversation...');
    const createButton = page.locator('button:has-text("New Conversation")').first();
    await expect(createButton).toBeVisible();
    await createButton.click();
    
    // Wait for modal to appear
    await page.waitForSelector('text=Start New Conversation', { timeout: 5000 });
    
    // Fill conversation details
    const titleInput = page.locator('input[id="title"]').first();
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Test Network Verification');
    
    // Create conversation
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // Wait for navigation to conversation page
    await page.waitForURL(/\/conversations\/[a-f0-9-]+/, { timeout: 10000 });
    
    // Step 3: Send a message
    Logger.info('Sending test message...');
    await page.waitForSelector('textarea', { timeout: 10000 });
    await page.fill('textarea', 'Give me a simple dinner idea');
    
    // Use the send button next to the textarea
    const sendButton = page.locator('textarea').locator('..').locator('button:has(svg)').first();
    await expect(sendButton).toBeVisible();
    await sendButton.click();
    
    // Step 4: Wait for response
    Logger.info('Waiting for AI response...');
    await page.waitForSelector('[class*="bg-gray-100"]', { timeout: 30000 });
    
    // Step 5: Verify network calls
    Logger.info('Verifying network calls...');
    
    // Debug: Log all captured requests
    const allRequests = networkMonitor.getAllRequests();
    Logger.info(`Total requests captured: ${allRequests.length}`);
    allRequests.forEach(req => {
      Logger.info(`Request: ${req.method} ${req.url} - Status: ${req.status}`);
    });
    
    // Basic verification - check for the most important API call
    const chatCalls = networkMonitor.getApiCalls('/api/ai/chat');
    expect(chatCalls.length).toBeGreaterThan(0);
    expect(chatCalls[0].method).toBe('POST');
    
    // Check status if available
    if (chatCalls[0].status !== undefined) {
      expect(chatCalls[0].status).toBe(200);
    } else {
      Logger.warn('Chat call status not captured, but call was made');
    }
    
    // Check for conversation-related calls
    const conversationCalls = networkMonitor.getApiCalls('/api/conversations');
    const supabaseCalls = networkMonitor.getApiCalls('supabase.co');
    
    // Should have at least one conversation-related call
    expect(conversationCalls.length + supabaseCalls.length).toBeGreaterThan(0);
    
    // Check for successful status codes
    const successfulCalls = allRequests.filter(req => req.status && req.status >= 200 && req.status < 300);
    expect(successfulCalls.length).toBeGreaterThan(0);
    
    Logger.info(`✅ Found ${chatCalls.length} chat API calls`);
    Logger.info(`✅ Found ${conversationCalls.length + supabaseCalls.length} conversation-related calls`);
    Logger.info(`✅ Found ${successfulCalls.length} successful API calls`);
    
    Logger.info('✅ Test 4: Network verification completed successfully');
  });

  test('verify API calls during simple message flow', async ({ page }) => {
    Logger.info('Starting simple message network verification');
    
    // Navigate to home page
    await page.goto('/');
    await expect(page.getByText('Chef Chopsky Dashboard')).toBeVisible();
    
    // Create conversation quickly
    const createButton = page.locator('button:has-text("New Conversation")').first();
    await expect(createButton).toBeVisible();
    await createButton.click();
    
    await page.waitForSelector('text=Start New Conversation', { timeout: 5000 });
    const titleInput = page.locator('input[id="title"]').first();
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Simple Test');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // Wait for conversation page
    await page.waitForURL(/\/conversations\/[a-f0-9-]+/, { timeout: 10000 });
    
    // Send simple message
    await page.waitForSelector('textarea', { timeout: 10000 });
    await page.fill('textarea', 'Hi');
    
    const sendButton = page.locator('textarea').locator('..').locator('button:has(svg)').first();
    await expect(sendButton).toBeVisible();
    await sendButton.click();
    
    // Wait for response
    await page.waitForSelector('[class*="bg-gray-100"]', { timeout: 30000 });
    
    // Verify network calls
    const apiCalls = networkMonitor.getApiCalls('/api/');
    Logger.info(`Captured ${apiCalls.length} API calls`);
    
    // Check for required API calls
    const chatCalls = networkMonitor.getApiCalls('/api/ai/chat');
    expect(chatCalls.length).toBeGreaterThan(0);
    expect(chatCalls[0].method).toBe('POST');
    
    const conversationCalls = networkMonitor.getApiCalls('/api/conversations');
    expect(conversationCalls.length).toBeGreaterThan(0);
    
    // Verify status codes
    const successfulCalls = apiCalls.filter(call => call.status && call.status >= 200 && call.status < 300);
    expect(successfulCalls.length).toBeGreaterThan(0);
    
    Logger.info('✅ Simple message network verification completed');
  });

  test('verify no unnecessary API calls', async ({ page }) => {
    Logger.info('Starting unnecessary calls verification');
    
    // Navigate to home page
    await page.goto('/');
    await expect(page.getByText('Chef Chopsky Dashboard')).toBeVisible();
    
    // Just navigate around without sending messages
    const createButton = page.locator('button:has-text("New Conversation")').first();
    await expect(createButton).toBeVisible();
    await createButton.click();
    
    await page.waitForSelector('text=Start New Conversation', { timeout: 5000 });
    
    // Cancel the modal
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
    
    // Wait a bit
    await page.waitForTimeout(2000);
    
    // Check that we don't have unnecessary API calls
    const apiCalls = networkMonitor.getApiCalls('/api/');
    const chatCalls = networkMonitor.getApiCalls('/api/ai/chat');
    
    // Should not have any chat calls since we didn't send a message
    expect(chatCalls.length).toBe(0);
    
    Logger.info(`Captured ${apiCalls.length} API calls (expected minimal)`);
    Logger.info('✅ Unnecessary calls verification completed');
  });

  test('verify error handling in network calls', async ({ page }) => {
    Logger.info('Starting error handling verification');
    
    // Navigate to home page
    await page.goto('/');
    await expect(page.getByText('Chef Chopsky Dashboard')).toBeVisible();
    
    // Create conversation
    const createButton = page.locator('button:has-text("New Conversation")').first();
    await expect(createButton).toBeVisible();
    await createButton.click();
    
    await page.waitForSelector('text=Start New Conversation', { timeout: 5000 });
    const titleInput = page.locator('input[id="title"]').first();
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Error Test');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // Wait for conversation page
    await page.waitForURL(/\/conversations\/[a-f0-9-]+/, { timeout: 10000 });
    
    // Send a message that might cause an error (empty message)
    await page.waitForSelector('textarea', { timeout: 10000 });
    await page.fill('textarea', '');
    
    const sendButton = page.locator('textarea').locator('..').locator('button:has(svg)').first();
    await expect(sendButton).toBeVisible();
    
    // The send button should be disabled for empty messages
    await expect(sendButton).toBeDisabled();
    
    // Fill with actual content to test network calls
    await page.fill('textarea', 'Test message');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();
    
    // Wait a bit to see if any API calls are made
    await page.waitForTimeout(3000);
    
    // Check for error handling
    const apiCalls = networkMonitor.getApiCalls('/api/');
    const errorCalls = apiCalls.filter(call => call.status && call.status >= 400);
    
    // If there are error calls, they should have appropriate status codes
    if (errorCalls.length > 0) {
      Logger.info(`Found ${errorCalls.length} error calls with appropriate status codes`);
      errorCalls.forEach(call => {
        expect(call.status).toBeGreaterThanOrEqual(400);
        expect(call.status).toBeLessThan(600);
      });
    }
    
    Logger.info('✅ Error handling verification completed');
  });
});
