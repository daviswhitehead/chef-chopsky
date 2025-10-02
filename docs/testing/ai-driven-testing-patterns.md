# AI-Driven Testing Patterns

## Overview

This guide captures proven patterns for AI-assisted test development based on our E2E improvements experience. These patterns help maintain test reliability while leveraging AI for faster development.

## Core Principles

### 1. Environment-Gated Development
- Use `DEBUG_E2E=1` during development for verbose output
- Clean output by default for CI/production
- Rich debugging context when needed

### 2. Centralized Patterns
- Centralize waits, cleanup, and diagnostics
- Use established utilities (`TestEnvironment`, `TestUtils`, `Logger`)
- Follow consistent patterns across all tests

### 3. Robust Isolation
- Proper cleanup prevents cross-test contamination
- Unique test data prevents conflicts
- Route cleanup prevents handler leaks

## AI-Assisted Development Workflow

### Phase 1: Test Planning (AI + Human)
1. **AI**: Generate test scenarios based on user stories
2. **Human**: Review and refine scenarios
3. **AI**: Propose test structure and selectors
4. **Human**: Approve or modify approach

### Phase 2: Implementation (AI + Human)
1. **AI**: Generate test code using established patterns
2. **Human**: Review for anti-patterns
3. **AI**: Iterate based on feedback
4. **Human**: Validate test behavior

### Phase 3: Stabilization (AI + Human)
1. **AI**: Identify flaky patterns and suggest fixes
2. **Human**: Approve fixes and test locally
3. **AI**: Optimize performance and cleanup
4. **Human**: Final validation and CI integration

## Proven Patterns

### Test Structure Pattern
```ts
import { test, expect } from '@playwright/test';
import { TestEnvironment, TestUtils } from './fixtures/setup';
import { Logger } from './fixtures/logger';

test.describe('Feature: [Name]', () => {
  let env: TestEnvironment;
  
  test.beforeEach(async ({ page }) => { 
    env = new TestEnvironment(); 
    await env.setup(page); 
  });
  
  test.afterEach(async () => { 
    await env.cleanup(); // Critical for isolation
  });

  test('happy path', async ({ page }) => {
    Logger.info('Starting happy path test');
    
    // Test steps with centralized utilities
    await TestUtils.createConversation(page, 'Test Title');
    await TestUtils.sendMessage(page, 'Test message');
    
    // Robust waits with fallback
    await TestUtils.waitForLoadingToComplete(page).catch(async () => {
      await page.waitForSelector('[class*="bg-gray-100"]', { timeout: 5000 });
    });
    
    // A11y-first assertions
    await expect(page.getByText('Test message')).toBeVisible();
    
    Logger.info('✅ Happy path test completed successfully');
  });
});
```

### Route Mocking Pattern
```ts
// Register BEFORE user action
await page.route('**/api/ai/chat', (route, req) => {
  const isRetry = req.postDataJSON()?.retryAttempt > 0;
  return isRetry
    ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: 'OK' }) })
    : route.fulfill({ status: 500, body: JSON.stringify({ error: 'Down' }) });
});

// Trigger user action
await page.getByRole('button', { name: 'Send' }).click();

// Cleanup handled by TestEnvironment.cleanup()
```

### Data Readiness Pattern
```ts
// Create data
const conversationId = await TestUtils.createConversation(page, 'Title');

// Wait for readiness (if needed)
await expect.poll(async () => {
  const response = await page.request.get(`/api/conversations/${conversationId}`);
  return response.status();
}).toBe(200);

// Navigate
await page.goto(`/conversations/${conversationId}`);
```

## AI Prompting Strategies

### Effective Prompts for Test Generation
```
"Generate a Playwright test for [scenario] using our established patterns:
- Use TestEnvironment for setup/cleanup
- Use Logger for environment-gated output
- Use a11y-first selectors
- Include proper error handling
- Follow the centralized wait patterns"
```

### Code Review Prompts
```
"Review this test for:
- Anti-patterns (console.log, CSS selectors, missing cleanup)
- Proper use of TestEnvironment and Logger
- Robust wait patterns
- A11y-first selectors
- Route cleanup"
```

## Quality Gates

### Pre-Commit Checklist
- [ ] Uses `Logger.info/debug` instead of `console.log`
- [ ] Uses `TestEnvironment` for setup/cleanup
- [ ] Uses a11y-first selectors
- [ ] Includes proper error handling
- [ ] Registers routes before user actions
- [ ] Waits for data readiness when needed
- [ ] Uses centralized wait patterns

### CI Integration
- [ ] Tests pass with `workers=1` (CI mode)
- [ ] No debug artifacts in production
- [ ] Proper failure diagnostics
- [ ] Clean output by default

## Common AI Mistakes to Avoid

### 1. Generating Without Context
❌ **Bad**: "Generate a test for login"
✅ **Good**: "Generate a test for login using our TestEnvironment pattern with Logger and a11y selectors"

### 2. Ignoring Established Patterns
❌ **Bad**: Creating new utilities instead of using existing ones
✅ **Good**: Using `TestUtils.waitForLoadingToComplete()` instead of custom waits

### 3. Missing Cleanup
❌ **Bad**: Not including `TestEnvironment.cleanup()`
✅ **Good**: Always including proper cleanup in `afterEach`

### 4. Using Brittle Selectors
❌ **Bad**: `page.locator('.css-class')`
✅ **Good**: `page.getByRole('button', { name: 'Submit' })`

## Performance Optimization

### AI-Assisted Optimization
1. **AI**: Analyze test execution patterns
2. **AI**: Identify slow operations
3. **AI**: Suggest optimization strategies
4. **Human**: Implement and validate

### Common Optimizations
- Service health caching
- Parallel test execution
- Optimized wait patterns
- Reduced artifact generation

## Maintenance Patterns

### Regular AI-Assisted Maintenance
1. **AI**: Scan for anti-patterns
2. **AI**: Suggest improvements
3. **Human**: Review and implement
4. **AI**: Validate improvements

### Automated Quality Checks
- Lint rules for test patterns
- Automated anti-pattern detection
- Performance regression detection
- Flake detection and reporting

## Future Enhancements

### AI Capabilities to Explore
- Automatic test generation from user stories
- Intelligent flake detection and fixing
- Performance optimization suggestions
- Test coverage analysis and improvement

### Tooling Improvements
- Better AI integration with test runners
- Automated test pattern validation
- Intelligent test data generation
- Smart test organization and parallelization
