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
- Standard requestId + timing logs in API routes and pages.
- On failure: print console errors, critical server logs, and last failed network payload.
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
import { TEST_SCENARIOS } from './fixtures/test-data';

test.describe('Feature: Chat flow', () => {
  let env: TestEnvironment;
  test.beforeEach(async ({ page }) => { env = new TestEnvironment(); await env.setup(page); });
  test.afterEach(async () => { await env.cleanup(); });

  test('happy path', async ({ page }) => {
    const id = await TestUtils.createConversation(page, 'My convo');
    await TestUtils.sendMessage(page, TEST_SCENARIOS.SIMPLE_MESSAGE);
    await TestUtils.waitForLoadingToComplete(page).catch(async () => {
      await page.waitForSelector('[class*="bg-gray-100"]', { timeout: 5000 });
    });
    await TestUtils.waitForToast(page, 'success');
    await expect(page.getByText(TEST_SCENARIOS.SIMPLE_MESSAGE)).toBeVisible();
  });
});
```
