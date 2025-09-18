import { test, expect } from '@playwright/test';
import { TestEnvironment } from './fixtures/setup';

test.describe('Debug Modal Issue', () => {
  let testEnv: TestEnvironment;

  test.beforeEach(async ({ page }) => {
    testEnv = new TestEnvironment();
    await testEnv.setup(page);
  });

  test.afterEach(async () => {
    await testEnv.cleanup();
  });

  test('debug modal appearance', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take a screenshot before clicking
    await page.screenshot({ path: 'debug-before-click.png' });

    // Check if button exists
    const createButton = page.locator('button:has-text("New Conversation")').first();
    await expect(createButton).toBeVisible();
    
    // Click the button
    await createButton.click();
    
    // Wait a bit for any animations
    await page.waitForTimeout(1000);
    
    // Take a screenshot after clicking
    await page.screenshot({ path: 'debug-after-click.png' });

    // Check what's actually on the page
    const pageContent = await page.content();
    console.log('Page content after click:', pageContent.substring(0, 1000));

    // Check for any modal-related elements
    const modalElements = await page.locator('[class*="fixed"]').count();
    console.log('Number of fixed elements:', modalElements);

    // Check for the specific text
    const startNewConversationText = await page.locator('text=Start New Conversation').count();
    console.log('Number of "Start New Conversation" elements:', startNewConversationText);

    // Check for any form elements
    const formElements = await page.locator('form').count();
    console.log('Number of form elements:', formElements);

    // Check for input elements
    const inputElements = await page.locator('input').count();
    console.log('Number of input elements:', inputElements);

    console.log('✅ Debug test completed');
  });
});
