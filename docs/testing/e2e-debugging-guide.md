# E2E Debugging Guide

## Quick Debugging Workflow

### 1. Enable Verbose Logging
```bash
DEBUG_E2E=1 npm run test:e2e -- --grep "test-name"
```

### 2. Check Failure Attachments
- Console errors: Check browser console for JavaScript errors
- Network payloads: Look for failed API calls and their responses
- Screenshots: Visual state when test failed
- HTML: Page source at failure point

### 3. Common Issues & Solutions

#### Test Timeout
**Symptoms**: Test hangs or times out after 120s
**Debug**: 
- Check if spinner is stuck: `Logger.info('Spinner visible:', await page.locator('[class*="spinner"]').isVisible())`
- Check assistant bubble fallback: `Logger.info('Assistant bubble visible:', await page.locator('[class*="bg-gray-100"]').isVisible())`
**Solution**: Use `TestUtils.waitForLoadingToComplete()` with fallback

#### Cross-Test Contamination
**Symptoms**: Tests pass individually but fail when run together
**Debug**: Check if routes are properly cleaned up
**Solution**: Ensure `TestEnvironment.cleanup()` is called in `afterEach`

#### Navigation Issues
**Symptoms**: `page.waitForURL()` times out
**Debug**: Log actual URL vs expected: `Logger.info('Actual URL:', page.url())`
**Solution**: Use more flexible URL patterns or check for data readiness first

#### Selector Issues
**Symptoms**: `expect().toBeVisible()` fails
**Debug**: Check if element exists: `Logger.info('Element count:', await page.locator('selector').count())`
**Solution**: Use a11y selectors (`getByRole`, `getByText`) instead of CSS

### 4. Debugging Commands

```bash
# Run specific test with verbose logging
DEBUG_E2E=1 npm run test:e2e -- --grep "test-name"

# Run with headed mode to see browser
npm run test:e2e -- --headed --grep "test-name"

# Run single test file
npm run test:e2e tests/e2e/specific-file.spec.ts

# Open HTML report after failure
npx playwright show-report
```

### 5. Debugging Patterns

#### Check Element State
```ts
Logger.info('Element visible:', await page.locator('selector').isVisible());
Logger.info('Element count:', await page.locator('selector').count());
Logger.info('Element text:', await page.locator('selector').textContent());
```

#### Check Network State
```ts
Logger.info('Current URL:', page.url());
Logger.info('Console errors:', await page.evaluate(() => window.console.errors));
```

#### Check Loading State
```ts
const spinnerVisible = await page.locator('[class*="spinner"]').isVisible();
const assistantBubbleVisible = await page.locator('[class*="bg-gray-100"]').isVisible();
Logger.info('Spinner:', spinnerVisible, 'Assistant bubble:', assistantBubbleVisible);
```

### 6. Performance Debugging

#### Check Test Timing
```ts
const startTime = Date.now();
// ... test steps ...
Logger.info('Test duration:', Date.now() - startTime, 'ms');
```

#### Check Service Health
```ts
Logger.info('Services healthy:', await ServiceHealthChecker.waitForServices());
```

### 7. When to Use Each Debugging Tool

- **Logger.info/debug**: For step-by-step test flow debugging
- **Screenshots**: When visual state is unclear
- **Console errors**: For JavaScript/network issues
- **Network payloads**: For API call debugging
- **HTML attachments**: For DOM structure issues
- **Headed mode**: For interactive debugging

### 8. Debugging Checklist

Before asking for help, check:
- [ ] Is `DEBUG_E2E=1` enabled?
- [ ] Are failure attachments available?
- [ ] Is `TestEnvironment.cleanup()` being called?
- [ ] Are routes registered before user actions?
- [ ] Are a11y selectors being used?
- [ ] Is data readiness being waited for?
- [ ] Are fallback waits implemented?

### 9. Common Anti-Patterns

❌ **Don't do this:**
```ts
console.log('Debug info'); // Use Logger.info instead
page.locator('.css-selector'); // Use getByRole/getByText
await page.waitForLoadState('networkidle'); // Use specific waits
// Missing cleanup
```

✅ **Do this:**
```ts
Logger.info('Debug info'); // Environment-gated
page.getByRole('button', { name: 'Submit' }); // A11y-first
await TestUtils.waitForLoadingToComplete(page); // Centralized wait
await env.cleanup(); // Proper cleanup
```
