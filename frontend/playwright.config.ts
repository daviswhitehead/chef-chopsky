import { defineConfig, devices } from '@playwright/test';

/**
 * Simple Playwright config for MVP E2E testing
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Run one test at a time for simplicity
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Always use 1 worker for simplicity
  reporter: 'list',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Only test on Chrome for MVP simplicity
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Auto-start dev server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});