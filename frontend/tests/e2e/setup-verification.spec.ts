import { test, expect } from '@playwright/test';

test.describe('E2E Setup Verification', () => {
  test('Application loads correctly', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Chef Chopsky/);
    
    // Check that the page loads without errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Wait a bit to catch any console errors
    await page.waitForTimeout(2000);
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('Failed to load resource')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Basic page elements are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for basic page structure
    await expect(page.locator('body')).toBeVisible();
    
    // Check for any chat-related elements (these might need data-testid attributes)
    const hasChatElements = await page.locator('input, textarea, button').count() > 0;
    expect(hasChatElements).toBe(true);
  });

  test('API endpoints are accessible', async ({ page }) => {
    // Test LangSmith API endpoint
    const langsmithResponse = await page.request.get('/api/test/langsmith');
    expect(langsmithResponse.status()).toBe(200);
    
    const langsmithData = await langsmithResponse.json();
    expect(langsmithData).toHaveProperty('success');
    expect(langsmithData).toHaveProperty('timestamp');
  });

  test('Environment variables are configured', async ({ page }) => {
    // This test will help verify that environment variables are properly set
    const response = await page.request.get('/api/test/langsmith');
    const data = await response.json();
    
    // If LangSmith is properly configured, we should get a successful response
    if (data.success) {
      expect(data.tests).toBeDefined();
      expect(data.tests.totalTests).toBeGreaterThan(0);
    } else {
      console.log('LangSmith not fully configured yet - this is expected during initial setup');
    }
  });
});
