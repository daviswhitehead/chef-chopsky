# Integration Testing Guide

## 🎯 Overview

This guide explains how integration tests work in Chef Chopsky and how they follow best-in-class patterns from top-tier software organizations.

## 🏆 Best-in-Class Integration Testing Patterns

### How Top Companies Handle Integration Tests

**Google, Netflix, Stripe, and other top-tier companies** use these patterns:

1. **Multi-Scenario Testing**: Tests run in multiple scenarios (services up, services down, error conditions)
2. **Service-Aware Tests**: Tests automatically start/stop services as needed
3. **Isolated Environments**: Each test run gets a clean environment
4. **Comprehensive Coverage**: Tests cover happy paths, error handling, and edge cases

## 🧪 Our Integration Test Scenarios

### Scenario 1: Services Running (Happy Path)
- **Purpose**: Test the full integration when everything is working
- **Services**: Frontend + Agent both running
- **Tests**: 
  - Service health checks
  - Complete message flow
  - Message persistence
  - Performance validation

### Scenario 2: Services Down (Error Handling)
- **Purpose**: Test error handling when services are unavailable
- **Services**: None running
- **Tests**:
  - Service unavailable detection
  - API error handling
  - Graceful degradation

### Scenario 3: Invalid Requests (Validation)
- **Purpose**: Test input validation and error responses
- **Services**: Frontend + Agent running
- **Tests**:
  - Invalid request format rejection
  - Malformed JSON handling
  - Invalid message format validation

### Scenario 4: Performance & Timeouts
- **Purpose**: Test performance characteristics and timeout handling
- **Services**: Frontend + Agent running
- **Tests**:
  - Request completion time validation
  - Timeout scenario handling
  - Resource usage monitoring

## 🚀 How to Run Integration Tests

### Option 1: Comprehensive Test Suite (Recommended)
```bash
# Runs all scenarios automatically
npm run test:integration:comprehensive
```

This will:
1. Start services automatically
2. Run happy path tests
3. Stop services
4. Run error handling tests
5. Start services again
6. Run validation tests
7. Run performance tests
8. Clean up everything

### Option 2: Individual Scenarios
```bash
# Run only specific scenarios
npm run test:integration:scenarios
```

### Option 3: Manual Service Management
```bash
# Start services manually
npm run dev

# In another terminal, run tests
npm run test:integration

# Stop services manually
# (Ctrl+C in the terminal running npm run dev)
```

## 🔧 Test Architecture

### Service Manager
- **Purpose**: Automatically starts/stops services for tests
- **Features**: Health checks, timeout handling, cleanup
- **Location**: `service-manager.ts`

### Integration Test Runner
- **Purpose**: Orchestrates multiple test scenarios
- **Features**: Scenario management, error handling, reporting
- **Location**: `integration-test-runner.ts`

### Comprehensive Test Suite
- **Purpose**: Implements all test scenarios
- **Features**: Multi-scenario testing, service lifecycle management
- **Location**: `comprehensive-integration.test.ts`

## 📊 What Each Test Validates

### Service Health Tests
- ✅ Frontend service responds on port 3000
- ✅ Agent service responds on port 3001
- ✅ Health endpoints return correct status

### Communication Tests
- ✅ Frontend can call Agent service
- ✅ Agent service processes requests correctly
- ✅ Responses are properly formatted

### Persistence Tests
- ✅ Messages are saved to Supabase
- ✅ Conversations are created correctly
- ✅ Data retrieval works properly

### Error Handling Tests
- ✅ Services unavailable → proper error responses
- ✅ Invalid requests → validation errors
- ✅ Timeouts → graceful failure

### Performance Tests
- ✅ Requests complete within reasonable time
- ✅ No memory leaks or resource issues
- ✅ Concurrent requests handled properly

## 🎯 Expected Test Results

### When Services Are Running
- ✅ **Service Health**: All health checks pass
- ✅ **Communication**: API calls succeed
- ✅ **Persistence**: Data is saved and retrieved
- ✅ **Performance**: Requests complete quickly

### When Services Are Down
- ✅ **Error Detection**: Tests detect services unavailable
- ✅ **Graceful Failure**: No crashes or infinite waits
- ✅ **Proper Error Codes**: 503, connection refused, etc.

### When Requests Are Invalid
- ✅ **Validation**: 400 Bad Request for invalid data
- ✅ **Error Messages**: Clear, actionable error responses
- ✅ **No Crashes**: Services remain stable

## 🔍 Debugging Integration Tests

### Enable Verbose Logging
```bash
DEBUG_E2E=1 npm run test:integration:comprehensive
```

### Check Service Status
```bash
# Check if services are running
npm run health:check

# Check specific ports
curl http://localhost:3000/
curl http://localhost:3001/health
```

### View Test Output
- Tests use the Logger utility for structured output
- Errors are logged with context and stack traces
- Service lifecycle events are tracked

## 🚨 Common Issues & Solutions

### Services Won't Start
- **Check**: Dependencies installed (`npm install` in both directories)
- **Check**: Environment variables set correctly
- **Check**: Ports not in use by other processes

### Tests Timeout
- **Check**: Services are actually running
- **Check**: Network connectivity
- **Check**: Service startup time (may need longer timeout)

### Tests Fail Unexpectedly
- **Check**: Service logs for errors
- **Check**: Database connectivity
- **Check**: API key configuration

## 📈 CI/CD Integration

### GitHub Actions
The integration tests are designed to run in CI:

```yaml
- name: Run Integration Tests
  run: |
    npm run test:integration:comprehensive
```

### Docker Support
Tests can run in Docker containers for complete isolation:

```dockerfile
# Services run in separate containers
# Tests run in test container
# Clean environment for each test run
```

## 🎉 Success Criteria

Integration tests are successful when:

1. **✅ All scenarios pass**: Happy path, error handling, validation, performance
2. **✅ Services start/stop cleanly**: No hanging processes or resource leaks
3. **✅ Tests are deterministic**: Same results every time
4. **✅ Fast execution**: Complete test suite runs in <5 minutes
5. **✅ Clear reporting**: Easy to understand what passed/failed and why

## 🔄 Continuous Improvement

### Monitoring Test Health
- Track test execution time trends
- Monitor flaky test patterns
- Measure service startup reliability

### Expanding Coverage
- Add more error scenarios
- Test edge cases and boundary conditions
- Add performance benchmarks

### Optimizing Performance
- Parallel test execution where safe
- Faster service startup
- Reduced test data setup time

---

This integration testing approach ensures Chef Chopsky has production-ready reliability and follows industry best practices for testing distributed systems.
