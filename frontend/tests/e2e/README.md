# End-to-End Tests

This directory contains Playwright-based end-to-end tests for the Chef Chopsky chat interface.

## Test Structure

### Test Files
- **`core-functionality.spec.ts`** - ✅ **WORKING** - Basic functionality tests (home page, services, API routes)
- **`chat-flow.spec.ts`** - Happy path scenarios (create conversation, send messages, receive responses) - *Requires UI fixes*
- **`error-recovery.spec.ts`** - Error handling and retry mechanism tests - *Requires UI fixes*
- **`message-persistence.spec.ts`** - Database persistence and data integrity tests - *Requires UI fixes*

### Fixtures
- **`fixtures/test-data.ts`** - Test data generation and cleanup utilities
- **`fixtures/setup.ts`** - Test environment setup and common utilities

## Running Tests

### Prerequisites
1. Both services must be running:
   - Frontend: `npm run dev` (port 3000)
   - Agent: `npm run dev` in `../agent` (port 3001)

2. Environment variables must be set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `AGENT_SERVICE_URL=http://localhost:3001`

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests (step through)
npm run test:e2e:debug

# List all tests without running
npm run test:e2e -- --list
```

### Test Scenarios

#### Core Functionality Tests ✅ **WORKING**
- ✅ Home page loads correctly
- ✅ Both services are healthy (frontend + agent)
- ✅ API route responds correctly
- ✅ Page navigation works

#### Happy Path Tests *Requires UI fixes*
- ⚠️ Create conversation and send simple message
- ⚠️ Send complex message with multiple ingredients
- ⚠️ Send long message and verify text wrapping

#### Error Recovery Tests *Requires UI fixes*
- ⚠️ Agent service down → error handling → retry → success
- ⚠️ Network timeout → automatic retry mechanism
- ⚠️ Invalid response → graceful error handling
- ⚠️ Empty message → validation error

#### Persistence Tests *Requires UI fixes*
- ⚠️ Messages persist after page refresh
- ⚠️ Conversation list shows created conversations
- ⚠️ Message metadata is preserved
- ⚠️ Error messages are persisted and can be retried

## Test Data Management

Tests use isolated test data with unique identifiers:
- Test conversations: `test-{timestamp}-{random}`
- Test users: `test-user-{testRunId}`
- Automatic cleanup after each test run

## Browser Support

Tests run on:
- ✅ Chromium (Desktop Chrome)
- ✅ Firefox (Desktop Firefox)  
- ✅ WebKit (Desktop Safari)

## Configuration

See `playwright.config.ts` for:
- Service startup configuration
- Test timeout settings
- Browser project configuration
- Reporter settings

## Troubleshooting

### Services Not Starting
- Ensure both frontend and agent services are running
- Check that ports 3000 and 3001 are available
- Verify environment variables are set

### Test Failures
- **Core functionality tests**: Should work if services are running
- **UI tests**: Currently failing due to conversation page module resolution issues
- Check browser console for errors
- Verify Supabase connection
- Ensure agent service is responding to `/health`

### Known Issues
- **Conversation page**: Module resolution error with `lucide-react` in development
- **Modal creation**: CreateConversation modal not appearing (likely related to above)
- **Chat interface**: Not rendering on conversation pages due to module issues

### Data Cleanup
- Tests automatically clean up test data
- Manual cleanup queries available in test fixtures
- Check Supabase for orphaned test data if needed
