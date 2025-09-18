import { test, expect } from '@playwright/test';
import { TestEnvironment } from './fixtures/setup';

test.describe('Debug State Issue', () => {
  let testEnv: TestEnvironment;

  test.beforeEach(async ({ page }) => {
    testEnv = new TestEnvironment();
    await testEnv.setup(page);
  });

  test.afterEach(async () => {
    await testEnv.cleanup();
  });

  test('debug state management', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await page.waitForSelector('button:has-text("New Conversation")');

    // Check if the button exists and is clickable
    const createButton = page.locator('button:has-text("New Conversation")').first();
    await expect(createButton).toBeVisible();
    
    // Check the button's onclick handler
    const buttonElement = await createButton.elementHandle();
    const onclick = await buttonElement?.getAttribute('onclick');
    console.log('Button onclick attribute:', onclick);

    // Click the button and wait for any state changes
    await createButton.click();
    
    // Wait for React to process the state change
    await page.waitForTimeout(2000);
    
    // Check if any modal-related elements appeared
    const modalDiv = await page.locator('div:has-text("Start New Conversation")').count();
    console.log('Modal div count:', modalDiv);

    // Check for any elements with modal-related classes
    const modalClasses = await page.locator('[class*="fixed"][class*="inset-0"]').count();
    console.log('Fixed inset-0 elements:', modalClasses);

    // Check for any elements with z-50 class
    const z50Elements = await page.locator('[class*="z-50"]').count();
    console.log('Z-50 elements:', z50Elements);

    // Check the page title to see if it changed
    const title = await page.title();
    console.log('Page title:', title);

    // Check if there are any console errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    // Wait a bit more and check for errors
    await page.waitForTimeout(1000);
    console.log('Console errors:', logs);

    console.log('✅ State debug test completed');
  });
});
