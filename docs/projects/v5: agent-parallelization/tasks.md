## Starter Agent Task Briefs (Batch 1)

### 1) UI: TypingIndicator component (shared RN/RNW)
Task: Implement a cross-platform `TypingIndicator` using gluestack + NativeWind.
Context: `frontend/components/`; used by `frontend/components/ChatInterface.tsx`.
Goal: Show animated three-dot typing indicator; accessible; responsive across web/desktop/tablet/mobile.
DoD:
- New `TypingIndicator.tsx` (shared) with a11y props, keyboard focus handling.
- Responsive design: scales appropriately across all screen sizes.
- Story/usage snippet added to PR description.
- Unit or lightweight integration test where feasible; covered by E2E.
- Lint/types clean; CI tests pass.
Tests:
- Update/add Playwright to assert presence while message streaming.
- Test responsive behavior across viewport sizes.
Artifacts: screenshots or short gif showing responsive behavior.

### 2) UI: MessageBubble component (shared RN/RNW)
Task: Create `MessageBubble` supporting user/assistant variants, error state, and copy button.
Context: `frontend/components/MessageBubble.tsx`.
Goal: Consistent layout, selectable text, accessible buttons; responsive design.
DoD:
- Component + styles; props for role, isError, isStreaming.
- Responsive: adapts text size, padding, button placement across devices.
- a11y labels/roles; keyboard navigation.
- Update `ChatInterface.tsx` to use component.
Tests:
- Playwright checks: render variants, copy-to-clipboard works (web), mobile-safe.
- Responsive testing across viewport sizes.
Artifacts: screenshots before/after showing responsive behavior.

### 3) E2E: Core chat flows
Task: Stabilize and extend E2E tests for conversation start/send/feedback.
Context: `frontend/tests/e2e/` and `frontend/app/api/conversations/route.ts`.
Goal: Headless, fast, stable tests with role-based selectors and minimal fixtures.
DoD:
- Add/repair tests named `chat.core.spec.ts` with resilient selectors.
- Ensure test data setup/teardown in `fixtures/setup.ts` is minimal and idempotent.
- Tests pass in CI; no flaky failures.
- Update CI to run these in the existing workflow only if needed.

### 4) Agent Graph: Retry/backoff with structured errors
Task: Add exponential backoff and structured error typing to one LangGraph node.
Context: `agent/src/retrieval_graph/` choose a node with external calls.
Goal: Improve robustness; keep signatures stable; add unit-level tests if meaningful.
DoD:
- Implement retry policy (jittered exponential) and error shape `{ kind, cause, advice }`.
- Log to LangSmith traces (only when `LANGSMITH_API_KEY` env var is set).
- Tests or E2E coverage demonstrating behavior.
- CI tests pass.

### 5) Observability: LangSmith tracing for happy path
Task: Enable tracing around request/response in server path.
Context: `agent/dist/server-langchain.js` source equiv `agent/src/server.ts`.
Goal: Trace primary user request path and one tool invocation.
DoD:
- Minimal instrumentation; only active when `LANGSMITH_API_KEY` is set.
- No performance impact when tracing is disabled.
- Link to trace or screenshot in PR.

### 6) CI: Improve caching and fail-fast checks
Task: Optimize GitHub Actions workflow caching and add fail-fast checks.
Context: `.github/workflows/auto-fix-ci.yml` and related workflows.
Goal: Faster CI runs, better caching, earlier failure detection.
DoD:
- Add npm/pnpm cache steps where missing.
- Add fail-fast on lint/types errors before running expensive tests.
- Ensure all tests still pass; no regressions.
- Document any workflow changes in PR description.


