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
- [ ] Create `/app/api/ai/chat/route.ts`
  - [ ] Validate incoming request (conversation_id, message content)
  - [ ] Persist user message to Supabase
  - [ ] Call agent service via HTTP
  - [ ] Persist assistant response to Supabase
  - [ ] Return response to frontend
- [ ] Error handling
  - [ ] Agent service unavailable → return 503 with user-friendly message
  - [ ] Invalid request → return 400 with validation errors
  - [ ] Database errors → return 500 with generic error message

### 2.2 Supabase Integration
- [ ] Review existing schema in `frontend/supabase/migrations/`
  - [ ] Verify conversations and messages tables are suitable
  - [ ] Plan for future columns if needed (provider, model, usage, latency)
- [ ] Update Supabase client calls
  - [ ] Ensure proper error handling for database operations
  - [ ] Add transaction handling for user + assistant message persistence

### 2.3 Environment Configuration
- [ ] Update `frontend/.env.example` with:
  - [ ] `AGENT_SERVICE_URL=http://localhost:3001` (for local dev)
  - [ ] Existing Supabase env vars (already present)
- [ ] Add environment validation in API route
  - [ ] Check required env vars on startup
  - [ ] Provide clear error messages for missing config

---

## 🎯 User Story 3: UI Integration

**As a user, I can send messages in the chat interface and see AI responses appear.**

### 3.1 ChatInterface Updates
- [ ] Update `ChatInterface.tsx` to call `/api/ai/chat`
  - [ ] Replace mock/placeholder logic with real API call
  - [ ] Add loading state while agent processes
  - [ ] Handle success/error responses
- [ ] Loading indicator
  - [ ] Show typing indicator or spinner while waiting for response
  - [ ] Disable send button during processing
  - [ ] Clear input after successful send

### 3.2 Message Display
- [ ] Ensure proper message ordering by created_at
- [ ] Display both user and assistant messages
- [ ] Add timestamps (if not already present)
- [ ] Handle long messages with proper text wrapping

### 3.3 Error States
- [ ] Show error toast for failed requests
- [ ] Retry mechanism for transient failures
- [ ] Graceful degradation if agent service is down

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

**Current Status:** 🚧 Planning Complete  
**Next Milestone:** Agent Service Setup  
**Estimated Completion:** 2-3 development sessions  

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
- [ ] All tests pass
- [ ] Documentation updated for local development
- [ ] Manual smoke test successful

---

*Last Updated: [Current Date]*  
*Next Review: After Agent Service Setup*
