# Chef Chopsky Agent Testing

This document explains how to run tests for the Chef Chopsky LangGraph agent.

## 🧪 Test Types

### Unit Tests
- **Location**: `src/__tests__/agent.test.ts`
- **Purpose**: Test individual agent functionality
- **Coverage**: Basic functionality, error handling, performance

### Integration Tests
- **Location**: `src/__tests__/*.int.test.ts`
- **Purpose**: Test end-to-end agent workflows
- **Coverage**: Full agent execution with real LangGraph server

## 🚀 Running Tests

### Prerequisites

1. **LangGraph Dev Server**: Must be running on port 2024
2. **Environment Variables**: 
   - `OPENAI_API_KEY` (required)
   - `LANGSMITH_API_KEY` (optional, for tracing)

### Quick Start

```bash
# Start LangGraph dev server (in one terminal)
yarn dev

# Run tests (in another terminal)
yarn test
```

### Test Commands

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run only agent tests
yarn test:agent

# Run tests for CI
yarn test:ci
```

### Using the Test Runner Script

```bash
# Run tests with automatic server management
./scripts/test-agent.sh

# Run with coverage
./scripts/test-agent.sh --coverage

# Run in watch mode
./scripts/test-agent.sh --watch
```

## 🔧 Test Configuration

### Jest Configuration
- **File**: `jest.config.js`
- **Timeout**: 60 seconds per test
- **Coverage**: HTML and LCOV reports
- **Environment**: Node.js

### Test Environment
- **Server**: LangGraph dev server (port 2024)
- **Vector Store**: Memory (for testing)
- **LLM**: GPT-4o-mini
- **Embeddings**: text-embedding-3-small

## 📊 Test Coverage

The test suite covers:

### ✅ Basic Functionality
- CSA cooking question responses
- Different ingredient combinations
- Recipe generation quality
- Document retrieval

### ✅ Error Handling
- Empty message handling
- Invalid input handling
- Server connection errors

### ✅ Performance
- Response time validation
- Timeout handling
- Resource usage

## 🚀 CI/CD Integration

### GitHub Actions
- **File**: `.github/workflows/test-agent.yml`
- **Triggers**: Push to main/develop, PRs
- **Environment**: Ubuntu latest, Node.js 20
- **Artifacts**: Test results and coverage reports

### Local CI Simulation
```bash
# Run tests as they would run in CI
yarn test:ci
```

## 🐛 Troubleshooting

### Common Issues

1. **Server Not Running**
   ```bash
   # Start the dev server
   yarn dev
   ```

2. **Tests Timing Out**
   ```bash
   # Check server health
   curl http://localhost:2024/health
   ```

3. **Missing Environment Variables**
   ```bash
   # Set required variables
   export OPENAI_API_KEY="your-key-here"
   ```

4. **Port Conflicts**
   ```bash
   # Check what's using port 2024
   lsof -i :2024
   ```

### Debug Mode

```bash
# Run tests with verbose output
yarn test --verbose

# Run specific test
yarn test --testNamePattern="should respond to CSA cooking questions"
```

## 📈 Monitoring

### LangSmith Integration
- **Enabled**: When `LANGSMITH_API_KEY` is set
- **Project**: `chef-chopsky-test`
- **Run Names**: Automatically generated from test names (e.g., `test-should-respond-to-csa-cooking-questions`)
- **Tags**: `test`, `csa`, `automated`, plus category-specific tags
- **Metadata**: Includes full test name and timestamp

### Test Metrics
- **Response Time**: < 15 seconds
- **Success Rate**: > 95%
- **Coverage**: > 80%

## 🔄 Continuous Testing

### Pre-commit Hooks
```bash
# Install pre-commit hook
echo "yarn test:agent" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Watch Mode
```bash
# Run tests automatically on file changes
yarn test:watch
```

## 📝 Adding New Tests

1. **Create test file**: `src/__tests__/new-feature.test.ts`
2. **Follow naming convention**: `*.test.ts` for unit tests
3. **Use proper assertions**: Check response quality and performance
4. **Add to CI**: Tests run automatically in GitHub Actions

### Test Template
```typescript
import { describe, it, expect } from '@jest/globals';

describe('New Feature', () => {
  it('should work correctly', async () => {
    const config = {
      configurable: {
        userId: 'test-user',
        embeddingModel: 'text-embedding-3-small',
        retrieverProvider: 'memory',
        searchKwargs: { k: 3 },
        responseSystemPromptTemplate: 'You are Chef Chopsky, a helpful cooking assistant specializing in CSA-based meal planning and high-protein plant-based recipes.',
        responseModel: 'gpt-4o-mini',
        querySystemPromptTemplate: 'Generate a search query for cooking questions.',
        queryModel: 'gpt-4o-mini'
      },
      project_name: 'chef-chopsky-test',
      run_name: 'test-should-work-correctly',
      run_id: uuidv4(),
      tags: ['test', 'new-feature', 'automated'],
      metadata: {
        testType: 'automated',
        testName: 'should work correctly',
        timestamp: new Date().toISOString()
      }
    };
    
    // Test implementation
    expect(true).toBe(true);
  });
});
```
