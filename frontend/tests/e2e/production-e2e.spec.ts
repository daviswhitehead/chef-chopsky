import { test, expect } from '@playwright/test';
import { Logger } from './fixtures/logger';
import { ProductionTestEnvironment, ProductionTestUtils } from './fixtures/production-setup';

test.describe('Production E2E Tests', () => {
  let testEnv: ProductionTestEnvironment;

  test.beforeEach(async ({ page }) => {
    testEnv = new ProductionTestEnvironment();
    await testEnv.setup(page);
  });

  test.afterEach(async () => {
    await testEnv.cleanup();
  });

  test('production services health check', async ({ page }) => {
    Logger.info('🏥 Testing production services health...');
    
    // Test frontend accessibility
    await page.goto('/');
    await expect(page.getByText('Recent Conversations')).toBeVisible();
    
    // Test agent health endpoint
    const response = await page.request.get('https://chef-chopsky-production.up.railway.app/health');
    expect(response.ok()).toBe(true);
    
    const healthData = await response.json();
    expect(healthData.status).toBe('ok');
    expect(healthData.service).toBe('chef-chopsky-agent');
    
    Logger.info('✅ Production services health check passed');
  });

  test('production home page loads correctly', async ({ page }) => {
    Logger.info('🏠 Testing production home page...');
    
    await page.goto('/');
    
    // Check that main elements are visible
    await expect(page.locator('text=Recent Conversations')).toBeVisible();
    await expect(page.locator('button:has-text("New Conversation")')).toBeVisible();
    
    Logger.info('✅ Production home page loads correctly');
  });

  test('production conversation creation', async ({ page }) => {
    Logger.info('💬 Testing production conversation creation...');
    
    const conversationId = await ProductionTestUtils.createConversation(page, 'Production Test Conversation');
    
    // Verify we're on the conversation page
    expect(page.url()).toMatch(/\/conversations\/[a-f0-9-]+/);
    
    // Check that chat interface is ready
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
    
    const sendButton = page.locator('button:has(svg):near(textarea)').first();
    await expect(sendButton).toBeVisible();
    
    Logger.info('✅ Production conversation creation test passed');
  });

  test('production simple chat flow', async ({ page }) => {
    Logger.info('💭 Testing production simple chat flow...');
    
    const testMessage = 'Hello Chef Chopsky! Can you help me with a simple cooking question?';
    
    await ProductionTestUtils.testCompleteChatFlow(page, testMessage);
    
    Logger.info('✅ Production simple chat flow test passed');
  });

  test('production cooking question flow', async ({ page }) => {
    Logger.info('🍳 Testing production cooking question flow...');
    
    const cookingMessage = 'I have broccoli, carrots, and tofu. What can I cook for dinner tonight?';
    
    await ProductionTestUtils.testCompleteChatFlow(page, cookingMessage);
    
    Logger.info('✅ Production cooking question flow test passed');
  });

  test('production nutrition question flow', async ({ page }) => {
    Logger.info('🥗 Testing production nutrition question flow...');
    
    const nutritionMessage = 'What are some healthy plant-based protein sources I should include in my diet?';
    
    await ProductionTestUtils.testCompleteChatFlow(page, nutritionMessage);
    
    Logger.info('✅ Production nutrition question flow test passed');
  });

  test('production error handling', async ({ page }) => {
    Logger.info('⚠️ Testing production error handling...');
    
    // Create conversation
    const conversationId = await ProductionTestUtils.createConversation(page, 'Error Test Conversation');
    
    // Send a very long message that might cause issues
    const longMessage = 'A'.repeat(10000); // Very long message
    
    await ProductionTestUtils.sendMessage(page, longMessage);
    
    // Wait for either response or error
    try {
      await ProductionTestUtils.waitForLoadingToComplete(page, 15000);
      Logger.info('✅ Long message handled successfully');
    } catch (error) {
      // Check if error handling is working
      const errorElement = page.locator('[role="alert"]');
      if (await errorElement.isVisible()) {
        Logger.info('✅ Error handling working correctly');
      } else {
        throw error;
      }
    }
    
    Logger.info('✅ Production error handling test passed');
  });

  test('production database persistence', async ({ page }) => {
    Logger.info('💾 Testing production database persistence...');
    
    // Create conversation and send message
    const conversationId = await ProductionTestUtils.createConversation(page, 'Persistence Test');
    await ProductionTestUtils.sendMessage(page, 'This is a test message for persistence');
    await ProductionTestUtils.waitForLoadingToComplete(page);
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if conversation still exists
    expect(page.url()).toMatch(/\/conversations\/[a-f0-9-]+/);
    
    // Check if message is still there
    const messageElement = page.locator('text=This is a test message for persistence');
    await expect(messageElement).toBeVisible();
    
    Logger.info('✅ Production database persistence test passed');
  });
});
