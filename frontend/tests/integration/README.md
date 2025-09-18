# Integration Tests

This directory contains integration tests that verify the communication between different services and components of the Chef Chopsky application.

## Test Structure

### Test Files
- **`index.test.ts`** - Main integration test suite with environment validation
- **`frontend-agent-communication.test.ts`** - Tests communication between frontend and agent services
- **`supabase-persistence.test.ts`** - Tests database persistence and data integrity
- **`langsmith-tracing.test.ts`** - Tests LangSmith tracing and observability
- **`environment-configuration.test.ts`** - Tests environment configuration and service discovery

### Utilities
- **`setup.ts`** - Integration test environment setup and utilities
- **`setup.ts`** - Test environment configuration and service health checks

## Running Integration Tests

### Prerequisites
1. Both services must be running:
   - Frontend: `npm run dev` (port 3000)
   - Agent: `npm run dev` in `../agent` (port 3001)

2. Environment variables must be set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `AGENT_SERVICE_URL=http://localhost:3001`
   - `OPENAI_API_KEY` (for agent service)

### Test Commands

```bash
# Run all integration tests
npm run test:integration

# Run integration tests in watch mode
npm run test:integration:watch

# Run integration tests with coverage
npm run test:integration:coverage

# Run all tests (unit + integration + e2e)
npm run test:all
```

## Test Categories

### 1. Frontend ↔ Agent Communication
Tests the HTTP communication between the Next.js frontend and the Node.js agent service:
- Direct agent service communication
- Frontend API proxy functionality
- Error handling and timeout scenarios
- Concurrent request handling
- Performance validation

### 2. Supabase Persistence
Tests database operations and data integrity:
- Conversation creation and retrieval
- Message persistence and ordering
- Referential integrity
- Concurrent data operations
- Error recovery and persistence

### 3. LangSmith Tracing
Tests observability and tracing functionality:
- Agent service tracing metadata
- Frontend API tracing propagation
- Trace completeness and quality
- Error and timeout tracing
- Cross-service trace consistency

### 4. Environment Configuration
Tests configuration validation and service discovery:
- Service configuration validation
- Environment variable handling
- Service health checks
- Configuration edge cases
- Environment isolation

## Test Data Management

Integration tests use isolated test data with unique identifiers:
- Test conversations: `test-conv-{testRunId}-{timestamp}`
- Test users: `test-user-{testRunId}`
- Test messages: `test-msg-{testRunId}-{timestamp}`
- Automatic cleanup after each test run

## Configuration

### Environment Variables
- `FRONTEND_URL` - Frontend service URL (default: http://localhost:3000)
- `AGENT_URL` - Agent service URL (default: http://localhost:3001)
- `TEST_TIMEOUT` - Test timeout in milliseconds (default: 30000)

### Jest Configuration
Integration tests use a separate Jest configuration (`jest.integration.config.js`) with:
- Node.js test environment
- Extended timeout (60 seconds)
- Sequential execution (maxWorkers: 1)
- Coverage reporting
- Custom setup files

## Test Patterns

### Service Health Checks
All integration tests start with service health validation:
```typescript
beforeAll(async () => {
  testEnv = new IntegrationTestEnvironment();
  await testEnv.setup(); // Validates service health
});
```

### Test Data Isolation
Each test uses unique identifiers to avoid conflicts:
```typescript
const conversationId = testData.generateTestConversationId();
const userId = testData.generateTestUserId();
```

### Error Handling
Tests verify both success and error scenarios:
```typescript
// Test success path
expect(response.ok).toBe(true);

// Test error path
expect(response.ok).toBe(false);
expect(response.status).toBe(400);
```

### Performance Validation
Tests include performance baselines:
```typescript
const startTime = Date.now();
// ... perform operation
const endTime = Date.now();
expect(endTime - startTime).toBeLessThan(30000);
```

## Troubleshooting

### Services Not Starting
- Ensure both frontend and agent services are running
- Check that ports 3000 and 3001 are available
- Verify environment variables are set correctly

### Test Failures
- Check service health endpoints manually
- Verify Supabase connection
- Ensure agent service is responding to `/health`
- Check network connectivity between services

### Timeout Issues
- Increase `TEST_TIMEOUT` environment variable
- Check service response times
- Verify no resource contention

### Data Conflicts
- Tests use unique identifiers to avoid conflicts
- Check for orphaned test data in Supabase
- Verify test cleanup is working correctly

## Best Practices

1. **Service Health**: Always verify service health before running tests
2. **Data Isolation**: Use unique identifiers for all test data
3. **Error Testing**: Test both success and error scenarios
4. **Performance**: Include performance baselines in tests
5. **Cleanup**: Ensure proper cleanup after each test
6. **Logging**: Use structured logging for debugging
7. **Timeouts**: Set appropriate timeouts for integration tests

## Integration with CI/CD

Integration tests are designed to run in CI environments:
- Sequential execution prevents resource conflicts
- Extended timeouts accommodate slower CI environments
- Comprehensive error reporting for debugging
- Coverage reporting for quality metrics

## Future Enhancements

- Add database seeding for complex scenarios
- Implement test data factories
- Add performance benchmarking
- Integrate with monitoring systems
- Add load testing capabilities

