# Frontend ↔ Agent Integration - Task List

**Feature:** v4: Frontend-Agent Integration  
**Goal:** End-to-end ChatGPT-like experience with LangChain agent  
**Status:** 🚧 In Progress  

---

## 📋 Overview

This task list implements the vertical slice: User creates conversation → sends message → agent responds → response appears in UI.

**Acceptance Criteria:**
- [ ] User can create a conversation from UI; persists in Supabase
- [ ] Sending a message triggers agent; both messages persist and display in order
- [ ] Minimal loading indicator; final text appears (buffered, no streaming)
- [ ] LangSmith traces with conversation_id, message_id, environment, model
- [ ] Anonymous usage works (no auth required)

---

## 🎯 User Story 1: Backend Agent Service

**As a developer, I need a standalone agent service that can process chat messages and return AI responses.**

### 1.1 Agent Service Setup
- [x] Create Express server in `agent/` directory
  - [x] Add Express dependency to `agent/package.json`
  - [x] Create `agent/src/server.ts` with basic Express setup
  - [x] Add CORS middleware for frontend communication
  - [x] Add request logging middleware
- [x] Environment configuration
  - [x] Update `agent/.env.example` with required keys:
    - `OPENAI_API_KEY`
    - `LANGCHAIN_TRACING_V2=true`
    - `LANGCHAIN_PROJECT=chef chopsky`
    - `LANGCHAIN_API_KEY` (optional, for LangSmith cloud)
    - `PORT=3001` (agent service port)
  - [x] Update `agent/src/config/index.ts` to include server config
- [x] Health check endpoint
  - [x] Add `GET /health` endpoint returning `{ status: "ok", timestamp }`

### 1.2 Chat Endpoint Implementation
- [x] Create `POST /chat` endpoint
  - [x] Request validation: `{ conversation_id, messages: [{role, content}], client_metadata? }`
  - [x] Response format: `{ assistant_message: { id, role: "assistant", content, model, usage? }, timing_ms }`
- [x] Integrate existing LangChain agent
  - [x] Import and configure agent from `agent/src/retrieval_graph/`
  - [x] Add conversation context handling
  - [x] Add error handling with proper HTTP status codes
- [x] LangSmith integration
  - [x] Add tracing with project name "chef chopsky"
  - [x] Include metadata: conversation_id, message_id, model, latency_ms
  - [x] Add tags: ["web", "agent", environment, model]

### 1.2.1 Complete LangChain Agent Integration
- [x] Replace mock response with actual LangChain agent execution
- [x] Test agent with real OpenAI API calls
- [x] Verify LangSmith tracing works with real agent runs
- [x] Handle agent errors and edge cases
- [x] Test with different message types and conversation flows

### 1.3 Testing & Documentation
- [x] Add integration test for `/chat` endpoint
  - [x] Test happy path: valid request → agent response
  - [x] Test error handling: invalid request, agent failure
  - [x] Test LangSmith tracing is working
- [x] Update `agent/README.md` with:
  - [x] How to run the agent service locally
  - [x] Environment setup instructions
  - [x] API endpoint documentation

---

## 🎯 User Story 2: Frontend API Proxy

**As a frontend developer, I need a Next.js API route that calls the agent service and persists messages.**

### 2.1 Next.js API Route
- [x] Create `/app/api/ai/chat/route.ts`
  - [x] Validate incoming request (conversation_id, message content)
  - [x] Persist user message to Supabase
  - [x] Call agent service via HTTP
  - [x] Persist assistant response to Supabase
  - [x] Return response to frontend
- [x] Error handling
  - [x] Agent service unavailable → return 503 with user-friendly message
  - [x] Invalid request → return 400 with validation errors
  - [x] Database errors → return 500 with generic error message

### 2.2 Supabase Integration
- [x] Review existing schema in `frontend/supabase/migrations/`
  - [x] Verify conversations and messages tables are suitable
  - [x] Plan for future columns if needed (provider, model, usage, latency)
- [x] Update Supabase client calls
  - [x] Ensure proper error handling for database operations
  - [x] Add transaction handling for user + assistant message persistence

### 2.3 Environment Configuration
- [x] Update `frontend/.env.example` with:
  - [x] `AGENT_SERVICE_URL=http://localhost:3001` (for local dev)
  - [x] Existing Supabase env vars (already present)
- [x] Add environment validation in API route
  - [x] Check required env vars on startup
  - [x] Provide clear error messages for missing config

---

## 🎯 User Story 3: UI Integration

**As a user, I can send messages in the chat interface and see AI responses appear.**

### 3.1 ChatInterface Updates
- [x] Update `ChatInterface.tsx` to call `/api/ai/chat`
  - [x] Replace mock/placeholder logic with real API call
  - [x] Add loading state while agent processes
  - [x] Handle success/error responses
- [x] Loading indicator
  - [x] Show typing indicator or spinner while waiting for response
  - [x] Disable send button during processing
  - [x] Clear input after successful send

### 3.2 Message Display
- [x] Ensure proper message ordering by created_at
- [x] Display both user and assistant messages
- [x] Add timestamps (if not already present)
- [x] Handle long messages with proper text wrapping

### 3.3 Error States
- [x] Show error toast for failed requests
- [x] Retry mechanism for transient failures
- [x] Graceful degradation if agent service is down

### 3.4 End-to-End Testing
- [x] Setup Playwright for E2E testing
  - [x] Install Playwright dependencies (`@playwright/test`)
  - [x] Configure Playwright for Next.js + Supabase integration
  - [x] Create `playwright.config.ts` with webServer configuration
  - [x] Add E2E test scripts to `package.json`
- [x] Create isolated test data management
  - [x] Create test database setup/teardown utilities
  - [x] Generate unique test conversation IDs and user data
  - [x] Add test data cleanup after each test run
- [x] Create core E2E test scenarios
  - [x] Happy path: create conversation → send message → receive response
  - [x] Error recovery: agent service down → retry → success
  - [x] Retry mechanism: network timeout → automatic retry → manual retry
  - [x] Message persistence: verify messages appear in Supabase
- [x] Test environment management
  - [x] Add service health checks before tests
  - [x] Configure test-specific environment variables
  - [x] Create test service startup/shutdown helpers

#### 3.4.1 Debug/Unblock Plan (Chat UI E2E)

"Textarea not visible" on the conversation page indicates the `ChatInterface` never mounts because data-loading hangs in the browser. Core routes and services work; the blocker is browser-side data access.

- Theories (most likely first)
  - Supabase client calls hang in-browser due to environment/permissions or network (RLS/CORS) when invoked from the page component.
  - SSR/CSR interplay causes data load to occur at the wrong time or with missing config; client guard reduces but does not remove the hang.
  - UI is waiting on a promise that never resolves; timeout fallback is client-only and not reached due to render path.

- Plan of record (stepwise to green E2E)
  1) Add internal API routes for reads: `GET /api/conversations/:id`, `GET /api/conversations/:id/messages` (server-side Supabase).
  2) Refactor conversation page to fetch via those API routes (client `fetch`) instead of browser Supabase client.
  3) Optionally route writes through API as well to stabilize tests; later reintroduce direct client writes if needed.
  4) Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are present in the browser (console log once) and that no auth listeners run during tests.
  5) Instrument fetches (console on client, logs on server) with start/stop timestamps to confirm no indefinite waits.
  6) Harden Playwright waits/selectors for `ChatInterface` (textarea, send button, loading indicators) and avoid `networkidle` reliance.

- Verification
  - E2E: navigate to conversation → textarea visible within 2–5s.
  - E2E: send message → loading indicator shows → response returns → assistant message appears.
  - No indefinite loading; logs confirm timely API responses (<2s local).

### 3.5 Integration Testing
- [ ] Setup integration test framework
  - [ ] Create integration test suite with real HTTP calls
  - [ ] Add service startup/shutdown helpers
  - [ ] Configure test environment isolation
- [ ] Create integration test scenarios
  - [ ] Frontend ↔ Agent Service communication
  - [ ] Supabase persistence integration
  - [ ] LangSmith tracing validation
  - [ ] Environment configuration testing

### 3.6 Test Validation & CI Integration
- [ ] Validate test coverage
  - [ ] Run E2E tests against local services
  - [ ] Verify tests pass in CI environment
  - [ ] Document test execution requirements
- [ ] Setup automated testing on PRs
  - [ ] Create GitHub Actions workflow for E2E tests
  - [ ] Configure CI to start both services automatically
  - [ ] Add test database setup in CI pipeline
  - [ ] Ensure tests run headlessly in CI
- [ ] Update development workflow
  - [ ] Add test commands to README
  - [ ] Document how to run tests locally
  - [ ] Add test requirements to development setup

---

## 🎯 User Story 4: Configuration & Documentation

**As a developer, I can easily set up and run the full stack locally.**

### 4.1 Environment Setup
- [ ] Update both `.env.example` files with all required variables
- [ ] Create setup script or documentation for:
  - [ ] Installing dependencies in both `agent/` and `frontend/`
  - [ ] Setting up environment variables
  - [ ] Running both services locally

### 4.2 Development Workflow
- [ ] Document how to run both services:
  - [ ] Agent service: `npm run dev` in `agent/` directory
  - [ ] Frontend: `npm run dev` in `frontend/` directory
  - [ ] Verify both are running on different ports
- [ ] Add development scripts
  - [ ] Consider adding `npm run dev:all` script in root
  - [ ] Add health check verification

---

## 🎯 User Story 5: Testing & Validation

**As a developer, I can verify the integration works end-to-end.**

### 5.1 Integration Tests
- [ ] Add test for full flow: create conversation → send message → get response
- [ ] Test error scenarios: agent down, invalid data, network issues
- [ ] Verify LangSmith traces are created correctly
- [ ] Test message persistence in Supabase

### 5.2 Manual Testing
- [ ] Smoke test: full user journey in browser
- [ ] Test with different message types and lengths
- [ ] Verify loading states and error handling
- [ ] Check browser network tab for proper API calls

---

## 📊 Progress Tracking

**Current Status:** 🚧 E2E Testing in Progress  
**Next Milestone:** Complete End-to-End Testing  
**Estimated Completion:** 3-4 development sessions  

### Blockers & Dependencies
- [ ] None currently identified

### Notes & Decisions
- Starting with buffered responses (no streaming) for simplicity
- Anonymous usage for v1; auth can be added later
- Using existing Supabase schema; may add columns later if needed

---

## 🔄 Definition of Done

- [ ] User can create conversation and send message in UI
- [ ] Agent processes message and returns response
- [ ] Both messages persist in Supabase
- [ ] Response appears in chat interface
- [ ] LangSmith traces show proper metadata
- [ ] All unit tests pass (API route, agent service)
- [ ] E2E tests pass (happy path, error recovery, retry mechanism)
- [ ] Integration tests pass (service communication, persistence)
- [ ] Tests run automatically on PRs via GitHub Actions
- [ ] Documentation updated for local development and testing
- [ ] Manual smoke test successful

---

*Last Updated: [Current Date]*  
*Next Review: After Agent Service Setup*
