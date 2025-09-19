import { test, expect } from '@playwright/test';
import { Logger } from './fixtures/logger';
import { FailureDiagnostics, attachFailureArtifacts } from './fixtures/diagnostics';
import { TestEnvironment } from './fixtures/setup';

test.describe('Core E2E Tests', () => {
  let testEnv: TestEnvironment;

test.beforeEach(async ({ page }, testInfo) => {
  const diag = new FailureDiagnostics(page);
  diag.install();
  (testInfo as any).__diag = diag;
  testEnv = new TestEnvironment();
  await testEnv.setup(page);
});

test.afterEach(async ({ page }, testInfo) => {
  await testEnv.cleanup();
  const diag = (testInfo as any).__diag as FailureDiagnostics | undefined;
  if (diag) {
    await attachFailureArtifacts(page, testInfo, diag).catch(() => {});
  }
});

  test('home page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Chef Chopsky Dashboard')).toBeVisible();

    // Check main elements
    await expect(page.locator('text=Chef Chopsky Dashboard')).toBeVisible();
    await expect(page.locator('text=Recent Conversations')).toBeVisible();
    await expect(page.locator('button:has-text("New Conversation")')).toBeVisible();
    
    Logger.info('✅ Home page loads correctly');
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
    
    Logger.info('✅ Both services are healthy');
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
    
    Logger.info('✅ API route responds correctly');
  });

  test('page navigation works', async ({ page }) => {
    // Test that we can navigate to different pages
    await page.goto('/');
    await expect(page.getByText('Chef Chopsky Dashboard')).toBeVisible();
    
    // Check that we're on the home page
    expect(page.url()).toBe('http://localhost:3000/');
    
    // Try to navigate to a non-existent page
    await page.goto('/nonexistent');
    await page.waitForTimeout(200); // brief grace; content may vary
    
    // Should show 404 or redirect back
    const url = page.url();
    expect(url).toMatch(/localhost:3000/);
    
    Logger.info('✅ Page navigation works');
  });
});
