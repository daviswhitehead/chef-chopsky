# Checks vs Triggers Matrix

A concise view of which checks run on which triggers. ✓ means the check runs for that trigger; – means it does not.

Triggers (columns):
- PR(main/develop): pull requests targeting `main` or `develop`
- PR(agent→main|master): pull requests that touch `agent/**` targeting `main`/`master` (test-agent workflow)
- Push(main/develop): direct pushes to `main` or `develop`
- Push(staging): pushes to `staging`
- Push(feat/*): pushes to feature branches (`feat/*` or `feature/*`)
- Push(main): pushes to `main` (production deployment)
- Schedule: hourly cron (health checks workflow)
- Manual: manual run of Health/Env workflow (`workflow_dispatch`)
- Manual(prod): manual production deployment (`workflow_dispatch`)
- Manual(sync): manual environment sync (`workflow_dispatch`)
- Workflow_run: triggered by completion of Production Deployment workflow

| Check type                                   | PR(main/develop) | PR(agent→main\|master) | Push(main/develop) | Push(staging) | Push(feat/*) | Push(main) | Schedule | Manual | Manual(prod) | Manual(sync) | Workflow_run |
|----------------------------------------------|:-----------------:|:-----------------------:|:------------------:|:-------------:|:------------:|:----------:|:--------:|:------:|:------------:|:------------:|:------------:|
| Linting (repo-wide)                          | ✓ (CI)            | –                       | ✓ (CI)             | ✓ (validate)  | ✓ (CI)      | ✓ (validate)| –        | –      | ✓ (validate) | –            | –            |
| Type-check (TS builds)                       | ✓ (CI build)      | ✓ (agent build)         | ✓ (CI build)       | ✓ (build)     | ✓ (build)   | ✓ (build)  | –        | –      | ✓ (build)    | –            | –            |
| Build (frontend + agent)                     | ✓ (CI)            | ✓ (agent)               | ✓ (CI)             | ✓             | ✓           | ✓          | –        | –      | ✓            | ✓            | –            |
| Unit tests – Frontend                        | ✓ (CI)            | –                       | ✓ (CI)             | ✓ (validate)  | ✓ (CI)      | ✓ (validate)| –        | –      | ✓ (validate) | –            | –            |
| Unit tests – Agent                           | ✓ (CI)            | ✓ (test-agent)          | ✓ (CI)             | ✓ (validate)  | ✓ (CI)      | ✓ (validate)| –        | –      | ✓ (validate) | –            | –            |
| Integration tests – Frontend                 | ✓ (CI integ)      | –                       | ✓ (CI integ)       | ✓ (validate)  | ✓ (CI)      | ✓ (validate)| –        | –      | ✓ (validate) | –            | –            |
| Integration tests – Agent                    | ✓ (CI integ)      | ✓ (test-agent)          | ✓ (CI integ)       | ✓ (validate)  | ✓ (CI)      | ✓ (validate)| –        | –      | ✓ (validate) | –            | –            |
| E2E tests – Playwright (frontend)            | ✓ (CI E2E)        | –                       | ✓ (CI E2E)         | ✓ (post-deploy)| ✓ (CI)     | ✓ (post-deploy)| –        | –      | ✓ (post-deploy)| ✓ (prod tests)| –            |
| High‑value integration (fast critical paths) | ✓ (CI)            | –                       | ✓ (CI)             | –             | ✓ (CI)      | –          | –        | –      | –            | –            | –            |
| Security audit (npm audit)                   | ✓ (CI security)   | –                       | ✓ (CI security)    | ✓ (validate)  | ✓ (CI)      | ✓ (validate)| –        | –      | ✓ (validate) | –            | –            |
| Health checks (remote prod/staging)          | ✓ (PR→main/stg)   | –                       | ✓ (push main/stg)  | ✓             | ✓           | ✓          | ✓        | ✓      | ✓            | –            | –            |
| Environment separation (remote)              | ✓ (PR manual mode)| –                       | –                  | –             | –           | –          | ✓*       | ✓*     | –            | –            | –            |
| Production tests (guards/keys/retriever)     | ✓ (PR→main/stg)   | –                       | ✓ (push main/stg)  | –             | –           | ✓          | ✓        | ✓      | ✓            | –            | –            |
| Staging tests (env validity/retriever)       | ✓ (PR→main/stg)   | –                       | ✓ (push main/stg)  | –             | –           | –          | ✓        | ✓      | –            | –            | –            |
| Deploy Agent to Staging (Railway)            | ✓ (PR→stg/main)   | –                       | –                  | ✓             | ✓           | –          | –        | ✓      | –            | –            | –            |
| Deploy Frontend to Staging (Vercel preview)  | ✓ (PR→stg/main)   | –                       | –                  | ✓             | ✓           | –          | –        | ✓      | –            | –            | –            |
| Deploy Agent to Production (Railway)         | –                 | –                       | –                  | –             | –           | ✓          | –        | –      | ✓            | –            | –            |
| Deploy Frontend to Production (Vercel)       | –                 | –                       | –                  | –             | –           | ✓          | –        | –      | ✓            | –            | –            |
| Post‑deploy tests (staging smoke/E2E)        | ✓ (if deploy ok)  | –                       | –                  | ✓             | ✓           | –          | –        | –      | –            | –            | –            |
| Post‑deploy tests (production smoke/E2E)     | –                 | –                       | –                  | –             | –           | ✓          | –        | –      | ✓            | –            | –            |
| Environment sync (Vercel env vars)           | –                 | –                       | –                  | –             | –           | –          | –        | –      | –            | ✓            | –            |
| Deployment notifications                     | –                 | –                       | –                  | –             | –           | ✓          | –        | –      | ✓            | –            | ✓            |
| Notifications / summaries                    | ✓                 | ✓ (agent results)       | ✓                  | ✓             | ✓           | ✓          | ✓        | ✓      | ✓            | ✓            | ✓            |
| Pre‑commit (husky)                           | –                 | –                       | –                  | –             | –           | –          | –        | –      | –            | –            | –            |

\* Environment separation runs when `test_type = environment-separation` is selected.

Cross‑reference
- CI: `.github/workflows/ci.yml`
- Test Agent: `.github/workflows/test-agent.yml`
- Health/Env: `.github/workflows/health-checks-and-environment-separation-tests.yml`
- Staging Deployment: `.github/workflows/staging-deployment.yml`
- Production Deployment: `.github/workflows/production-deployment.yml`
- Deployment Notifications: `.github/workflows/deployment-notifications.yml`
- Environment Sync: `.github/workflows/sync-production-env.yml`

## Recommended Additional Triggers

Based on common CI/CD best practices, consider adding these triggers:

### High Priority
- **Pre-commit hooks**: Add husky/lint-staged to catch issues before they reach CI
- **Release branches**: Add triggers for `release/*` branches with additional validation
- **Hotfix branches**: Add triggers for `hotfix/*` branches with expedited checks

### Medium Priority  
- **Dependency updates**: Add triggers for Dependabot PRs with security-focused checks
- **Documentation changes**: Add lighter checks for docs-only changes (`docs/**`)
- **Label-based triggers**: Add conditional E2E tests when PR has `run-e2e` label

### Low Priority
- **Weekly security scans**: Add scheduled comprehensive security audits
- **Performance regression tests**: Add periodic performance benchmarking
- **Cross-browser E2E tests**: Add matrix testing across browsers for critical paths

## Check Glossary

### Code Quality Checks

| Specific Check | What It Does | Why It's Important | Priority | Notes |
|---|---|---|---|---|
| **Linting (repo-wide)** | Runs ESLint across entire repository to enforce coding standards and catch syntax errors | Prevents inconsistent code style, catches common bugs, maintains code readability | High | Runs via `npm run lint` in CI workflows |
| **Type-check (TS builds)** | Compiles TypeScript code to verify type safety and catch compilation errors | Prevents runtime type errors, ensures API contracts, catches refactoring issues | High | Runs as part of build process; fails fast if types incompatible |
| **Build (frontend + agent)** | Compiles and bundles frontend (Next.js) and agent (Express) applications | Ensures code compiles successfully and produces deployable artifacts | High | Must pass before any deployment; catches build-time errors |

### Unit Tests

| Specific Check | What It Does | Why It's Important | Priority | Notes |
|---|---|---|---|---|
| **test (18.x)** | Runs unit tests on Node.js 18.x with frontend and agent test suites | Ensures compatibility with Node.js 18.x and validates core functionality | High | Matrix strategy test; runs `npm run test:unit` in both frontend and agent |
| **test (20.x)** | Runs unit tests on Node.js 20.x with frontend and agent test suites | Ensures compatibility with Node.js 20.x and validates core functionality | High | Matrix strategy test; runs `npm run test:unit` in both frontend and agent |
| **Frontend - Timeout Config** | Tests timeout configuration utilities and environment-specific timeouts | Ensures proper timeout handling across different environments | Medium | Tests `getTimeoutConfig()`, `getEnvironmentTimeouts()` functions |
| **Frontend - Component Logic** | Tests React component behavior, utilities, and frontend logic in isolation | Validates individual component behavior and catches UI regressions | High | Runs via `npm run test:unit` in frontend directory |
| **Agent - Environment Config** | Tests agent environment variable validation and configuration loading | Ensures agent starts with proper configuration and fails fast on invalid config | High | Tests environment variable validation and defaults |
| **Agent - Message Validation** | Tests message format validation and conversation ID format checking | Ensures API contracts are maintained and invalid data is rejected | High | Tests UUID validation, message structure validation |
| **Agent - Error Handling** | Tests error handling logic and graceful degradation scenarios | Ensures robust error handling and prevents crashes from invalid input | High | Tests error boundary behavior and exception handling |
| **Agent - Basic Functionality** | Tests core agent logic without requiring running server | Validates business logic and data processing without external dependencies | High | Tests message processing, response generation logic |

### Integration Tests

| Specific Check | What It Does | Why It's Important | Priority | Notes |
|---|---|---|---|---|
| **integration-e2e** | Runs comprehensive integration and E2E tests with service orchestration | Validates complete system integration and end-to-end user workflows | High | Starts services, runs integration tests, then E2E tests with Playwright |
| **integration-high-value** | Runs focused integration tests on critical user flows without full service orchestration | Provides fast feedback on business-critical functionality without E2E overhead | High | Runs `npm run test:integration:all` for service configuration and error handling |
| **Frontend ↔ Agent Communication** | Tests HTTP communication between Next.js frontend and Node.js agent service | Validates that frontend correctly integrates with backend services | High | Tests direct agent service communication, API proxy functionality |
| **Service Health Validation** | Tests that both frontend and agent services are running and responding | Ensures services are accessible before running integration tests | High | Tests service availability on ports 3000 and 3001 |
| **Database Persistence** | Tests Supabase database operations and data integrity | Validates that data is properly saved and retrieved from the database | High | Tests conversation creation, message persistence, referential integrity |
| **Complete User Journey** | Tests full flow: create conversation → send message → get response | Validates end-to-end user workflow through the application | High | Tests complete user journey with real API calls |
| **Error Handling Scenarios** | Tests error handling when services are unavailable or requests fail | Ensures graceful degradation and proper error responses | High | Tests service unavailable detection, API error handling |
| **Performance & Timeouts** | Tests request completion times and timeout scenario handling | Validates performance characteristics and timeout behavior | Medium | Tests request timing, timeout handling, resource usage |
| **Critical Issues Prevention** | Tests for common integration issues and edge cases | Prevents known integration problems from reaching production | High | Tests concurrent requests, data consistency, error recovery |

### E2E Tests

| Specific Check | What It Does | Why It's Important | Priority | Notes |
|---|---|---|---|---|
| **Core Functionality** | Tests basic functionality: home page, services, API routes, navigation | Validates that core application features work correctly | High | Tests home page loads, service health, API routes, page navigation |
| **Chat Flow - Happy Path** | Tests complete chat workflow: create conversation, send messages, receive responses | Validates the primary user workflow works end-to-end | High | Tests conversation creation, message sending, response handling |
| **Basic Chat Functionality** | Tests basic chat features: navigation, conversation creation, message sending | Validates fundamental chat interface functionality | High | Tests UI navigation, conversation creation via modal, message sending |
| **Simple Chat Tests** | Tests simplified chat scenarios for quick validation | Provides fast feedback on basic chat functionality | Medium | Tests home page navigation, direct conversation access, message sending |
| **Production Services Health** | Tests that production services are accessible and responding correctly | Validates production deployment health and service availability | High | Tests production frontend and agent service health endpoints |
| **Production Home Page** | Tests that production home page loads correctly with all UI elements | Validates production frontend deployment and UI functionality | High | Tests production home page loads, UI elements visible, navigation works |
| **Production API Routes** | Tests that production API routes respond correctly and handle requests | Validates production API functionality and request handling | High | Tests production API endpoints, request processing, response format |
| **Production Chat Functionality** | Tests complete chat functionality in production environment | Validates that production chat system works for end users | High | Tests production conversation creation, message sending, response handling |
| **Error Recovery** | Tests error handling and retry mechanisms in the UI | Validates graceful error handling and user experience during failures | Medium | Tests agent service down scenarios, network timeouts, retry mechanisms |
| **Message Persistence** | Tests database persistence and data integrity through the UI | Validates that user data is properly saved and retrieved | High | Tests message persistence, conversation data integrity, data retrieval |
| **Timeout Scenarios** | Tests timeout handling and user experience during slow responses | Validates timeout behavior and user feedback during delays | Medium | Tests request timeouts, loading states, timeout user experience |

### Security Checks

| Specific Check | What It Does | Why It's Important | Priority | Notes |
|---|---|---|---|---|
| **security** | Scans all npm dependencies for known security vulnerabilities | Prevents shipping code with known security flaws and keeps dependencies secure | Medium | Runs `npm audit --audit-level=moderate` on root, frontend, and agent packages |

### Environment & Health Checks

| Specific Check | What It Does | Why It's Important | Priority | Notes |
|---|---|---|---|---|
| **health-checks** | Probes live production and staging environments to verify services are running | Detects production outages and ensures deployed services are healthy | High | Runs hourly via cron; tests frontend, agent, and database connectivity |
| **environment-separation** | Validates that production and staging environments use different configurations | Prevents data leakage between environments and ensures proper isolation | High | Runs on schedule or manual trigger; validates config differences |
| **production-tests** | Validates production environment has proper API keys and production-ready retrievers | Ensures production cannot run in unsafe modes or with invalid configurations | High | Runs on production deployments; validates OpenAI keys and retriever config |
| **staging-tests** | Validates staging environment configuration and retriever setup | Ensures staging environment is properly configured for testing | Medium | Runs on staging deployments; validates environment variables |
| **test-summary** | Generates summary reports of test results and deployment status | Provides visibility into CI/CD pipeline health and makes it easy to identify issues | Low | Runs after most workflows; creates GitHub step summaries and artifact reports |

### Agent-Specific Tests

| Specific Check | What It Does | Why It's Important | Priority | Notes |
|---|---|---|---|---|
| **test-agent** | Runs comprehensive agent service tests including build, server startup, and functionality tests | Validates agent service works correctly in isolation and handles requests properly | High | Builds TypeScript, starts Express server, runs `npm run test:ci`, stops server |

### Deployment Checks

| Specific Check | What It Does | Why It's Important | Priority | Notes |
|---|---|---|---|---|
| **setup** | Validates deployment prerequisites and determines if deployment should proceed | Ensures deployment conditions are met before proceeding with actual deployment | High | Checks branch conditions, validates deployment triggers |
| **validate** | Runs pre-deployment validation including linting, unit tests, builds, integration tests, and security audits | Ensures code quality and functionality before deployment | High | Runs linting, unit tests, builds, integration tests, security audits |
| **deploy-agent** | Deploys the agent service to Railway (staging or production) | Ships agent changes to target environment for testing or end users | High | Deploys to Railway with environment-specific configuration |
| **deploy-frontend** | Deploys the frontend to Vercel (preview or production) | Ships frontend changes to target environment for testing or end users | High | Deploys to Vercel with environment-specific configuration |
| **post-deployment-tests** | Runs smoke tests and E2E tests against newly deployed environment | Validates that deployment was successful and application works correctly | High | Runs after deployment; includes health checks and basic E2E flows |
| **notify** | Sends notifications about deployment status to team channels | Keeps team informed about deployment status and provides quick access to URLs | Low | Runs after deployments; can integrate with Slack, email, etc. |

### External Service Checks

| Specific Check | What It Does | Why It's Important | Priority | Notes |
|---|---|---|---|---|
| **Vercel Preview Comments** | Checks for unresolved feedback on Vercel preview deployments | Ensures code review feedback is addressed before merging | Medium | Runs on Vercel preview deployments; shows unresolved/resolved feedback count |


