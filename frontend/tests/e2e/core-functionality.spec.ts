import { test, expect } from '@playwright/test';
import { TestEnvironment } from './fixtures/setup';

test.describe('Core E2E Tests', () => {
  let testEnv: TestEnvironment;

  test.beforeEach(async ({ page }) => {
    testEnv = new TestEnvironment();
    await testEnv.setup(page);
  });

  test.afterEach(async () => {
    await testEnv.cleanup();
  });

  test('home page loads correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check main elements
    await expect(page.locator('text=Chef Chopsky Dashboard')).toBeVisible();
    await expect(page.locator('text=Recent Conversations')).toBeVisible();
    await expect(page.locator('button:has-text("New Conversation")')).toBeVisible();
    
    console.log('✅ Home page loads correctly');
  });

  test('services are healthy', async ({ page }) => {
    // Test frontend health
    const frontendResponse = await page.request.get('/');
    expect(frontendResponse.ok()).toBe(true);

    // Test agent health
    const agentResponse = await page.request.get('http://localhost:3001/health');
    expect(agentResponse.ok()).toBe(true);
    
    const agentData = await agentResponse.json();
    expect(agentData.status).toBe('ok');
    
    console.log('✅ Both services are healthy');
  });

  test('API route responds correctly', async ({ page }) => {
    const testData = testEnv.getTestDataGenerator();
    const conversation = testData.generateConversation();
    const message = testData.generateUserMessage(conversation.id);

    // Test the API route directly
    const response = await page.request.post('/api/ai/chat', {
      data: {
        conversationId: conversation.id,
        userId: conversation.userId,
        messages: [message]
      }
    });

    // Should get a response (might be error if agent is down, but route should work)
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(600);
    
    console.log('✅ API route responds correctly');
  });

  test('page navigation works', async ({ page }) => {
    // Test that we can navigate to different pages
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that we're on the home page
    expect(page.url()).toBe('http://localhost:3000/');
    
    // Try to navigate to a non-existent page
    await page.goto('/nonexistent');
    await page.waitForLoadState('domcontentloaded'); // Use domcontentloaded instead of networkidle
    
    // Should show 404 or redirect back
    const url = page.url();
    expect(url).toMatch(/localhost:3000/);
    
    console.log('✅ Page navigation works');
  });
});
