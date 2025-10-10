import { test, expect } from '@playwright/test';

test.describe('Debug Page Rendering', () => {
  test('debug basic page rendering', async ({ page }) => {
    console.log('🔍 DEBUGGING: Starting basic page rendering test...');
    
    // Navigate to home page
    console.log('🔍 DEBUGGING: Navigating to home page...');
    await page.goto('/');
    
    console.log('🔍 DEBUGGING: Current URL:', page.url());
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const pageTitle = await page.title();
    console.log('🔍 DEBUGGING: Page title:', pageTitle);
    
    // Check for main content
    const mainContent = await page.locator('main, [role="main"]').count();
    console.log('🔍 DEBUGGING: Main content elements:', mainContent);
    
    // Check for any h1 elements
    const h1Elements = await page.locator('h1').count();
    console.log('🔍 DEBUGGING: H1 elements:', h1Elements);
    
    // Check for any textarea elements
    const textareaElements = await page.locator('textarea').count();
    console.log('🔍 DEBUGGING: Textarea elements:', textareaElements);
    
    // Check for any error messages
    const errorElements = await page.locator('[role="alert"], .error, .text-red-500').count();
    console.log('🔍 DEBUGGING: Error elements:', errorElements);
    
    // Check for loading states
    const loadingElements = await page.locator('.animate-spin, [class*="loading"]').count();
    console.log('🔍 DEBUGGING: Loading elements:', loadingElements);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-basic-page-rendering.png', fullPage: true });
    console.log('🔍 DEBUGGING: Screenshot saved');
    
    // Check console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('🔍 DEBUGGING: Console error:', msg.text());
      }
    });
    
    // Wait a bit to collect console errors
    await page.waitForTimeout(2000);
    console.log('🔍 DEBUGGING: Console errors collected:', consoleErrors);
    
    console.log('🔍 DEBUGGING: Basic page rendering test completed');
  });
  
  test('debug conversation page rendering', async ({ page }) => {
    console.log('🔍 DEBUGGING: Starting conversation page rendering test...');
    
    // Navigate to a new conversation page
    console.log('🔍 DEBUGGING: Navigating to new conversation page...');
    await page.goto('/conversations/new');
    
    console.log('🔍 DEBUGGING: Current URL:', page.url());
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const pageTitle = await page.title();
    console.log('🔍 DEBUGGING: Page title:', pageTitle);
    
    // Check for main content
    const mainContent = await page.locator('main, [role="main"]').count();
    console.log('🔍 DEBUGGING: Main content elements:', mainContent);
    
    // Check for any h1 elements
    const h1Elements = await page.locator('h1').count();
    console.log('🔍 DEBUGGING: H1 elements:', h1Elements);
    
    // Check for any textarea elements
    const textareaElements = await page.locator('textarea').count();
    console.log('🔍 DEBUGGING: Textarea elements:', textareaElements);
    
    // Check for any error messages
    const errorElements = await page.locator('[role="alert"], .error, .text-red-500').count();
    console.log('🔍 DEBUGGING: Error elements:', errorElements);
    
    // Check for loading states
    const loadingElements = await page.locator('.animate-spin, [class*="loading"]').count();
    console.log('🔍 DEBUGGING: Loading elements:', loadingElements);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-conversation-page-rendering.png', fullPage: true });
    console.log('🔍 DEBUGGING: Screenshot saved');
    
    // Check console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('🔍 DEBUGGING: Console error:', msg.text());
      }
    });
    
    // Wait a bit to collect console errors
    await page.waitForTimeout(2000);
    console.log('🔍 DEBUGGING: Console errors collected:', consoleErrors);
    
    console.log('🔍 DEBUGGING: Conversation page rendering test completed');
  });
});
