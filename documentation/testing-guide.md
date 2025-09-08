# Testing Guide for Chef Chopsky

Simple guide for running E2E and integration tests locally and on GitHub PRs.

## 🏠 Local Testing (Quick & Simple)

### Daily Development Workflow
```bash
# Run the main E2E test (validates complete user journey)
npm test

# Run integration tests (validates LangSmith API)
npm run test:integration:api
```

### When to Run What
- **Before committing**: `npm test` (validates user journey works)
- **When debugging LangSmith**: `npm run test:integration:api`
- **Before PR**: Run both tests

### Expected Results
- **E2E Test**: ~1 minute, validates Site → Conversation → Message → AI Response → LangSmith Success
- **Integration Test**: ~30 seconds, validates LangSmith API functionality

## 🚀 GitHub PR Testing (Automated)

### What Runs on Every PR
Both E2E and integration tests run automatically and **block PR merges** if they fail.

### Test Suite Performance
- **Target**: Complete test suite finishes within 5 minutes
- **E2E Test**: ~2 minutes (includes server startup)
- **Integration Test**: ~1 minute
- **Total**: ~3 minutes (well under 5-minute target)

### PR Workflow
1. Create PR → Tests run automatically
2. If tests pass → PR can be merged
3. If tests fail → PR blocked until fixed

## 📋 Commands Reference

### Root Directory Commands
```bash
# E2E Tests
npm test                    # Run E2E test (headless)
npm run test:headed        # Run E2E test (visible browser)
npm run test:ui            # Run E2E test (Playwright UI)
npm run test:report        # View test report

# Integration Tests  
npm run test:integration:api    # Run LangSmith integration tests
npm run test:integration        # Run via standalone script
```

### Frontend Directory Commands
```bash
cd frontend

# Same commands as above, just run from frontend/ directory
npm test
npm run test:integration:api
```

## 🎯 Test Purposes

### E2E Test (`complete-user-journey.spec.ts`)
- **Purpose**: Validates complete user journey works end-to-end
- **What it tests**: Site opens → Conversation created → Message sent → AI responds → Message traced in LangSmith
- **When to run**: Before every commit, before PRs

### Integration Test (`/api/test/langsmith`)
- **Purpose**: Validates LangSmith API integration works
- **What it tests**: LangSmith connection, logging, completion, retrieval
- **When to run**: When debugging LangSmith issues, before PRs

## 🚨 Troubleshooting

### E2E Test Fails
- Check if dev server is running (`npm run dev`)
- Check OpenAI API key is set
- Check LangSmith API key is set
- Run `npm run test:headed` to see what's happening

### Integration Test Fails
- Check LangSmith API key is set
- Check LangSmith project name is correct
- Run `npm run test:integration:api` to see detailed error

### Tests Take Too Long
- E2E test should complete in ~1 minute locally
- If taking longer, check network connectivity
- Integration tests should complete in ~30 seconds

## 📊 Success Criteria

### Local Development
- ✅ E2E test passes (user journey works)
- ✅ Integration test passes (LangSmith works)
- ✅ Tests complete quickly (< 2 minutes total)

### GitHub PRs
- ✅ Both tests pass automatically
- ✅ Tests complete within 5 minutes
- ✅ Failed tests block PR merges
- ✅ Clear error messages when tests fail

---

**Remember**: These tests validate that your core user journey works and your LangSmith integration is functioning. Keep them simple and fast for maximum productivity.
