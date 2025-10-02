## Chef Chopsky — Parallel Agent Operations Plan (v5)

### Purpose
Create a lightweight, repeatable system to delegate many small, parallelizable tasks to background agents (Cursor + others), review quickly, and ship vertical slices across frontend, agent graph, tests, and CI.

### Scope and Principles
- **Tech baseline**: TypeScript; React Native + React Native Web + Next.js; styling via gluestack UI + NativeWind; Supabase; Playwright E2E; LangChain/LangGraph for the agent.
- **Small tasks, big throughput**: Tasks sized for 1–3 hours, batched 4–8/night in parallel.
- **Definition of Done (DoD)**: Code + tests + docs, lint/types clean, E2E headless passing, small PR with clear description.
- **Guardrails**: No DOM-only APIs in shared RN components; a11y basics; stick to repo conventions and CI gates.

### Operating Cadence
- **Nightly**: Dispatch a batch of parallel tasks with briefs and acceptance tests.
- **Morning**: Review in 30–60 minutes; merge good PRs; one feedback cycle max; archive the rest.
- **Weekly**: Inspect metrics (merged-per-day, rework rate, test flake rate), refine briefs and batch sizing.

### Roles
- **You (Editor-in-Chief)**: Curate backlog, approve briefs, review diffs, request one revision, merge or archive.
- **Agents**: Implement tightly scoped briefs, add/update tests, keep CI green, document changes.

### Workstreams
1) Frontend UI: Shared RN/RNW components, pages, accessibility, error/empty states.
2) Agent Graph: LangGraph nodes, tools, retries/backoff, structured errors, LangSmith traces/evals.
3) Testing: Playwright E2E-first; fast, headless, resilient selectors; minimal fixtures.
4) CI/DevEx: GitHub Actions stability, caching, fail-fast checks, auto-fix flows.
5) Docs/Enablement: Keep docs current in `/documentation` and in-repo READMEs.

### Task Brief Template
Copy/paste and fill per task:

```md
Task: [verb-led title]
Context: [links to files/dirs, product doc, screenshots]
Goal: [user outcome + measurable acceptance]
Constraints:
- TypeScript everywhere; RN + RNW shared components; gluestack + NativeWind
- Supabase DB; Playwright E2E; avoid web-only libs in shared code
Definition of Done:
- Code + tests + docs updated
- Lint/types clean; Playwright passing headless; CI stable
- Small PR with description and screenshots/recording if UI
Artifacts:
- PR title/description
- Test names/paths changed
- Before/after screenshots if UI
Timebox: [e.g., 90 minutes]
```

### Review Checklist (fast)
- Lint/types: zero errors.
- Tests: new/updated Playwright for changes; stable role-based selectors; headless.
- Cross-platform: no DOM-only APIs in shared components.
- Accessibility: labels/roles on interactive elements.
- PR size and clarity: ≤ ~300 changed lines, good description, assets attached when UI changes.

### Evaluation and Telemetry
- **Tracing**: Enable LangSmith tracing for key agent nodes and happy-path flows.
- **Evals**: Maintain a minimal eval suite on core prompt/tool behaviors (dietary defaults, pantry utilization, refusal guardrails).
- **Signals**: track merged-per-day, rework rate, test stability; improve plan and batch sizes accordingly.

### Starter Batch (first week)
- Frontend: `TypingIndicator`, `MessageBubble`, `Toast` components using gluestack + NativeWind.
- E2E: Stable tests for conversation start/send/feedback flows.
- Agent Graph: Add retry/backoff with structured errors to one node; add refusal guardrail.
- Observability: Add LangSmith tracing on happy path in server.
- CI: Improve caching and fail-fast in auto-fix workflows.

### Risks and Mitigations
- PR conflicts from parallelization → split by seam (UI vs tests vs agent vs CI); cap batch size.
- Flaky E2E → role-based selectors, smaller fixtures, shorter timeouts.
- Over-scoping → timebox per brief, prefer follow-up tasks.

### Next Steps
- Seed backlog with 8–12 briefs across workstreams.
- Run one nightly batch; measure review time; adjust.
- Establish weekly retro to promote best prompts and patterns.


