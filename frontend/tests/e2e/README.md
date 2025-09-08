# E2E Testing with Playwright

End-to-end tests for Chef Chopsky using Playwright.

## Test Structure

- **`complete-user-journey.spec.ts`** - Tests the complete user flow:
  1. Open the site
  2. Create a new conversation  
  3. Send a message
  4. Wait for AI response
  5. Verify LangSmith tracing

## Running Tests

```bash
# Run E2E tests (headless)
npm test

# Run E2E tests with browser visible
npm run test:headed
```

## What the Tests Validate

- ✅ Site loads correctly
- ✅ New conversation creation works
- ✅ Message sending works
- ✅ AI responds (not stuck in loading state)
- ✅ Exact message appears in LangSmith
- ✅ LangSmith run reaches "success" status

## GitHub PR Testing

Tests run automatically on every pull request and push via GitHub Actions.