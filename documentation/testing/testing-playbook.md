### Automated Testing Playbook

Goal: Lightweight, repeatable, low‑friction testing that scales with features and prevents regressions.

#### Test Pyramid (project-specific)
- Unit: utilities and mappers (few).
- Integration: API routes and DB adapters (selective).
- End-to-End (primary): user flows and error recovery in Playwright; mock only third parties or flake-prone edges.

#### Feature Testing Contract
- Define user flows, expected toasts/states, retry behavior, error scenarios.
- Add 2–4 E2E tests: happy path + key failure/recovery.
- If backend/API changes: add 1–2 integration tests for route-only logic.
- Done = E2E passing locally, CI green, flake budget = 0.

#### Authoring Loop (AI-driven)
- Write executable test spec before code (red) → implement (green) → stabilize (refactor).
- Prefer a11y selectors; avoid brittle CSS.
- Use AI to propose selectors/mocks/timeouts; you approve edits.
- **NEW**: Use environment-gated logging (`DEBUG_E2E=1`) for verbose debugging during development.
- **NEW**: Always use `TestEnvironment` for proper cleanup and isolation.

#### Playwright Guidance
- Selectors: roles/text (`getByRole`, `getByText`, `[role="alert"]`). Add roles/labels in UI.
- Timeouts: global 120s; common waits ≤30s. Resilient waits: spinner detach OR assistant bubble.
- Network: mock third parties; simulate error then success for retry paths.
- Parallelism: local workers=2; CI workers=1.
- Reports: headless; do not auto-serve HTML; open on demand.

#### Flake SOP
- Add fallback waits; broaden assertions to visibility where appropriate.
- Reduce steps or add small grace waits after reload when upstream latency.
- Mock retry deterministically.
- Avoid just increasing timeouts blindly.

#### Route Mock Patterns
```ts
await page.route('**/api/ai/chat', (route, req) => {
  const isRetry = req.postDataJSON()?.retryAttempt > 0;
  return isRetry
    ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: 'OK', model: 'openai/gpt-5-nano' }) })
    : route.fulfill({ status: 500, body: JSON.stringify({ error: 'Down' }) });
});
```

#### Data & Environment
- Tests self-contained; create/delete via internal APIs.
- Local-only; compatible with GitHub runner.
- Deterministic factories when needed.

#### Instrumentation
- **Environment-gated logging**: Use `Logger.info/debug` (gated by `DEBUG_E2E`) instead of `console.log`.
- **Centralized failure diagnostics**: Attach console errors, network payloads, screenshots on failure.
- **Service health caching**: Per-worker health checks for faster test setup.
- **Readiness polling**: Wait for data creation before navigation (e.g., conversation creation).
- Enable trace only on CI retry.

#### CI Policy
- Jobs: lint, E2E, optional integration.
- Chromium only; single project.
- webServer managed by Playwright; CI workers=1; retries=1 with trace-on-retry.
- Block merges on E2E failure.

#### Conventions & Checklists
- Before coding: write/adjust E2E spec (happy + one error).
- During coding: ensure a11y roles/labels; stable API shapes + timeouts.
- Before PR: run E2E locally headless; ensure no debug artifacts in repo.
- After merge: fix recurrent flakes within 24–48h.

#### Scripts
- `npm run test:e2e` – local, headless, line reporter.
- `npx playwright test tests/e2e/... --grep "..."` – targeted runs.
- `npm run test:e2e:ci` – CI preset (workers=1, retries=1, trace on-retry).

#### Spec Template
```ts
import { test, expect } from '@playwright/test';
import { TestEnvironment, TestUtils } from './fixtures/setup';
import { Logger } from './fixtures/logger';
import { TEST_SCENARIOS } from './fixtures/test-data';

test.describe('Feature: Chat flow', () => {
  let env: TestEnvironment;
  test.beforeEach(async ({ page }) => { 
    env = new TestEnvironment(); 
    await env.setup(page); 
  });
  test.afterEach(async () => { 
    await env.cleanup(); 
  });

  test('happy path', async ({ page }) => {
    Logger.info('Starting happy path test');
    
    const id = await TestUtils.createConversation(page, 'My convo');
    await TestUtils.sendMessage(page, TEST_SCENARIOS.SIMPLE_MESSAGE);
    
    // Use centralized wait with fallback
    await TestUtils.waitForLoadingToComplete(page).catch(async () => {
      await page.waitForSelector('[class*="bg-gray-100"]', { timeout: 5000 });
    });
    
    await TestUtils.waitForToast(page, 'success');
    await expect(page.getByText(TEST_SCENARIOS.SIMPLE_MESSAGE)).toBeVisible();
    
    Logger.info('✅ Happy path test completed successfully');
  });
});
```

#### LLM Response Testing Patterns
**CRITICAL**: LLMs are non-deterministic. Never test exact content.

##### Key Principle: Optional vs Required Checks
- **REQUIRED**: API functionality, response structure, timing, format
- **OPTIONAL**: Domain-specific content, exact words, topic relevance
- **LOG, DON'T FAIL**: Use optional checks for debugging, not test failures

##### Available Utility Functions
- `TestUtils.validateLLMResponse(page, selector, terms, context)` - Full control
- `TestUtils.validateFoodResponse(page, context, additionalTerms)` - Food/cooking responses
- `TestUtils.validateCookingResponse(page, context, additionalTerms)` - Recipe/cooking responses  
- `TestUtils.validateAnyResponse(page, context)` - No content validation

##### ✅ Good Patterns
```ts
// REQUIRED: Test response structure and quality
expect(response.assistant_message.content).toBeTruthy();
expect(response.assistant_message.content.length).toBeGreaterThan(10);
expect(response.assistant_message.content).toMatch(/[.!?]$/); // Proper sentence ending

// REQUIRED: Test response format and timing
expect(response).toHaveProperty('assistant_message');
expect(response).toHaveProperty('timing_ms');
expect(response.timing_ms).toBeGreaterThan(0);
expect(response.timing_ms).toBeLessThan(30000);

// OPTIONAL: Domain relevance check (logged, not required)
const foodTerms = ['food', 'nutrition', 'diet', 'meal', 'recipe', 'cooking', 'healthy', 'eat', 'ingredient'];
const hasFoodTerms = foodTerms.some(term => 
  response.assistant_message.content.toLowerCase().includes(term)
);

// Log for debugging but don't fail the test
if (!hasFoodTerms) {
  console.log('ℹ️ LLM response did not contain expected food terms:');
  console.log('Response:', response.assistant_message.content.substring(0, 200) + '...');
  console.log('This is OK - LLMs are non-deterministic');
}
```

##### ❌ Bad Patterns (Avoid These)
```ts
// DON'T: Test exact content
expect(response.assistant_message.content).toContain('protein');
expect(response.assistant_message.content).toMatch(/vegetable|veggie/);

// DON'T: Test specific words that might vary
expect(response.assistant_message.content).toContain('chicken');
expect(response.assistant_message.content).toContain('broccoli');

// DON'T: Require domain-specific terms (will fail randomly)
expect(hasFoodTerms).toBe(true); // This will fail randomly
expect(response.assistant_message.content).toContain('nutrition');
```

##### Integration Test Example
```ts
it('should handle different message types', async () => {
  const response = await fetch(`${TEST_CONFIG.baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_id: uuidv4(),
      messages: [{ role: 'user', content: 'What are some good sources of plant protein?' }]
    }),
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  
  // REQUIRED: Test response quality, not content
  expect(data.assistant_message.content).toBeTruthy();
  expect(data.assistant_message.content.length).toBeGreaterThan(10);
  expect(data.assistant_message.content).toMatch(/[.!?]$/);
  
  // OPTIONAL: Test domain relevance (logged, not required)
  const foodTerms = ['food', 'nutrition', 'diet', 'meal', 'recipe', 'cooking', 'healthy', 'eat', 'ingredient'];
  const hasFoodTerms = foodTerms.some(term => 
    data.assistant_message.content.toLowerCase().includes(term)
  );
  
  // Log for debugging but don't fail the test
  if (!hasFoodTerms) {
    console.log('ℹ️ LLM response did not contain expected food terms:');
    console.log('Response:', data.assistant_message.content.substring(0, 200) + '...');
    console.log('This is OK - LLMs are non-deterministic');
  }
});
```

##### E2E Test Example (Using TestUtils)
```ts
test('send complex message and receive detailed response', async ({ page }) => {
  // Send message
  await TestUtils.sendMessage(page, 'I have tomatoes, onions, and chicken. Any suggestions?');
  
  // Wait for loading to complete
  await TestUtils.waitForLoadingToComplete(page);
  
  // Verify user message appears
  await TestUtils.waitForMessage(page, 'I have tomatoes, onions, and chicken. Any suggestions?');
  
  // Validate LLM response with optional content checking
  await TestUtils.validateFoodResponse(
    page, 
    'Complex message response',
    ['tomato', 'onion', 'chicken'] // Additional specific terms from user's message
  );
  
  // Verify success toast
  await TestUtils.waitForToast(page, 'success');
});
```

#### Anti-Patterns to Avoid
- ❌ Using `console.log` instead of `Logger.info/debug`
- ❌ Skipping `TestEnvironment.cleanup()` (causes cross-test contamination)
- ❌ Using CSS selectors instead of a11y selectors
- ❌ Hardcoded timeouts without fallback waits
- ❌ Not waiting for data readiness before navigation
- ❌ Registering routes after triggering user actions
- ❌ **Testing exact LLM response content** (LLMs are non-deterministic)
- ❌ **Using `toContain()` with specific words** (use broader term matching instead)
- ❌ **Requiring domain-specific terms in LLM responses** (will fail randomly)
- ❌ **Making content validation required instead of optional** (prioritize API functionality)
