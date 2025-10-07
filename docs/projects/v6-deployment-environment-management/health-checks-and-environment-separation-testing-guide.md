# Health Checks and Environment Separation Testing Guide

## Overview
This guide provides comprehensive documentation for automated health checks and environment separation testing for Chef Chopsky, ensuring system reliability and environment isolation.

## Table of Contents
1. [Testing Overview](#testing-overview)
2. [Health Check Tests](#health-check-tests)
3. [Environment Separation Tests](#environment-separation-tests)
4. [Production Validation Tests](#production-validation-tests)
5. [Staging Validation Tests](#staging-validation-tests)
6. [Test Configuration](#test-configuration)
7. [Test Execution](#test-execution)
8. [Test Monitoring](#test-monitoring)

---

## Testing Overview

### 🧪 Test Categories

#### Health Check Tests
- **Frontend Health**: Verify frontend accessibility and response times
- **Agent Health**: Verify agent health endpoints and service status
- **Database Health**: Verify database connectivity and responsiveness
- **Environment Configuration**: Verify environment-specific configuration

#### Environment Separation Tests
- **Environment Isolation**: Verify production and staging use different configurations
- **Data Isolation**: Verify different vector stores and indexes
- **Retriever Configuration**: Verify environment-appropriate retriever settings
- **Environment Discriminators**: Verify environment-specific discriminators

#### Production Validation Tests
- **API Key Validation**: Verify production uses valid API keys
- **Retriever Validation**: Verify production uses production-ready retrievers
- **Environment Guards**: Verify production environment guards are active

#### Staging Validation Tests
- **Environment Configuration**: Verify staging environment is properly configured
- **Retriever Configuration**: Verify staging uses appropriate retriever settings

### 📊 Test Matrix

| Test Category | Production | Staging | Frequency | Trigger |
|---------------|------------|---------|-----------|---------|
| **Health Checks** | ✅ | ✅ | Every hour | Schedule + Push/PR |
| **Environment Separation** | ✅ | ✅ | On Push/PR | Push/PR |
| **Production Validation** | ✅ | ❌ | On Push/PR | Push/PR |
| **Staging Validation** | ❌ | ✅ | On Push/PR | Push/PR |

---

## Health Check Tests

### 🔍 Health Check Overview

#### Test Objectives
- Verify all services are accessible and responding
- Monitor response times and performance
- Validate health endpoint responses
- Ensure environment configuration is correct

#### Test Coverage
- **Frontend Health**: HTTP status, response time, accessibility
- **Agent Health**: Health endpoint, service status, configuration
- **Database Health**: Database connectivity, API responsiveness
- **Environment Validation**: Environment-specific configuration

### 📋 Health Check Test Procedures

#### Frontend Health Tests
1. **Accessibility Test**:
   - Test HTTP status code (200)
   - Measure response time
   - Verify page loads correctly

2. **Performance Test**:
   - Check response time < 3 seconds
   - Verify no timeout errors
   - Monitor for performance degradation

3. **Functionality Test**:
   - Verify core features are accessible
   - Check for JavaScript errors
   - Validate page structure

#### Agent Health Tests
1. **Health Endpoint Test**:
   - Test `/health` endpoint
   - Verify response format
   - Check health status

2. **Service Status Test**:
   - Verify service is running
   - Check service configuration
   - Validate environment settings

3. **Configuration Test**:
   - Test `/config` endpoint
   - Verify environment variables
   - Check retriever configuration

#### Database Health Tests
1. **Connectivity Test**:
   - Test database connection
   - Verify API responsiveness
   - Check connection stability

2. **Performance Test**:
   - Measure query response times
   - Check for timeout errors
   - Monitor database performance

### 🔧 Health Check Implementation

#### Test Script Structure
```bash
# Test frontend health
curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL"

# Test agent health
curl -s "$AGENT_URL/health" | jq -r '.status'

# Test database health
curl -s "$FRONTEND_URL/api/health"
```

#### Health Check Validation
```bash
# Validate health status
if [ "$HEALTH_STATUS" == "ok" ]; then
  echo "✅ Service is healthy"
else
  echo "❌ Service is unhealthy"
  exit 1
fi
```

---

## Environment Separation Tests

### 🔒 Environment Separation Overview

#### Test Objectives
- Verify production and staging environments are isolated
- Ensure different configurations are used
- Validate data isolation between environments
- Check environment-specific settings

#### Test Coverage
- **Environment Isolation**: Different APP_ENV values
- **Data Isolation**: Different vector stores and indexes
- **Retriever Configuration**: Environment-appropriate retrievers
- **Environment Discriminators**: Environment-specific discriminators

### 📋 Environment Separation Test Procedures

#### Environment Isolation Tests
1. **Configuration Comparison**:
   - Compare production and staging configurations
   - Verify different APP_ENV values
   - Check environment-specific settings

2. **Service Isolation**:
   - Verify different service URLs
   - Check different database connections
   - Validate different API keys

#### Data Isolation Tests
1. **Vector Store Isolation**:
   - Verify different vector store indexes
   - Check different namespace prefixes
   - Validate data separation

2. **Database Isolation**:
   - Verify different database projects
   - Check different table prefixes
   - Validate data isolation

#### Retriever Configuration Tests
1. **Production Retriever Validation**:
   - Verify production uses production-ready retrievers
   - Check for memory retriever usage
   - Validate retriever configuration

2. **Staging Retriever Validation**:
   - Verify staging uses appropriate retrievers
   - Check retriever configuration
   - Validate environment settings

### 🔧 Environment Separation Implementation

#### Test Script Structure
```bash
# Test environment isolation
PROD_CONFIG=$(curl -s "$PROD_AGENT/config")
STAGING_CONFIG=$(curl -s "$STAGING_AGENT/config")

# Compare configurations
PROD_APP_ENV=$(echo "$PROD_CONFIG" | jq -r '.appEnv')
STAGING_APP_ENV=$(echo "$STAGING_CONFIG" | jq -r '.appEnv')
```

#### Environment Separation Validation
```bash
# Validate environment separation
if [ "$PROD_APP_ENV" == "production" ] && [ "$STAGING_APP_ENV" == "staging" ]; then
  echo "✅ Environment separation is valid"
else
  echo "❌ Environment separation is invalid"
  exit 1
fi
```

---

## Production Validation Tests

### 🏭 Production Validation Overview

#### Test Objectives
- Verify production environment is properly configured
- Ensure production uses valid API keys
- Validate production-ready retriever configuration
- Check production environment guards are active

#### Test Coverage
- **API Key Validation**: Verify valid OpenAI API keys
- **Retriever Validation**: Verify production-ready retrievers
- **Environment Guards**: Verify production guards are active
- **Configuration Validation**: Verify production-specific settings

### 📋 Production Validation Test Procedures

#### API Key Validation Tests
1. **OpenAI API Key Test**:
   - Verify API key is valid
   - Check for placeholder keys
   - Validate key format

2. **API Key Status Test**:
   - Test API key functionality
   - Check for authentication errors
   - Validate key permissions

#### Retriever Validation Tests
1. **Production Retriever Test**:
   - Verify production uses production-ready retrievers
   - Check for memory retriever usage
   - Validate retriever configuration

2. **Retriever Performance Test**:
   - Test retriever performance
   - Check for timeout errors
   - Validate retriever functionality

#### Environment Guards Tests
1. **Production Guards Test**:
   - Verify production guards are active
   - Check for mock mode usage
   - Validate guard configuration

2. **Guard Functionality Test**:
   - Test guard enforcement
   - Check for guard bypasses
   - Validate guard effectiveness

### 🔧 Production Validation Implementation

#### Test Script Structure
```bash
# Test production configuration
PROD_CONFIG=$(curl -s "$PROD_AGENT/config")

# Validate API key
OPENAI_KEY_STATUS=$(echo "$PROD_CONFIG" | jq -r '.openaiKeyStatus')

# Validate retriever
RETRIEVER_PROVIDER=$(echo "$PROD_CONFIG" | jq -r '.retrieverProvider')
```

#### Production Validation Logic
```bash
# Validate production retriever
if [ "$RETRIEVER_PROVIDER" == "pinecone" ] || [ "$RETRIEVER_PROVIDER" == "elastic" ] || [ "$RETRIEVER_PROVIDER" == "mongodb" ]; then
  echo "✅ Production retriever is production-ready"
else
  echo "❌ Production retriever is not production-ready"
  exit 1
fi
```

---

## Staging Validation Tests

### 🧪 Staging Validation Overview

#### Test Objectives
- Verify staging environment is properly configured
- Ensure staging uses appropriate retriever settings
- Validate staging-specific configuration
- Check staging environment isolation

#### Test Coverage
- **Environment Configuration**: Verify staging APP_ENV
- **Retriever Configuration**: Verify appropriate retrievers
- **Staging Settings**: Verify staging-specific settings
- **Environment Isolation**: Verify staging isolation

### 📋 Staging Validation Test Procedures

#### Environment Configuration Tests
1. **Staging Environment Test**:
   - Verify APP_ENV is set to staging
   - Check environment-specific settings
   - Validate staging configuration

2. **Environment Isolation Test**:
   - Verify staging is isolated from production
   - Check different service URLs
   - Validate different configurations

#### Retriever Configuration Tests
1. **Staging Retriever Test**:
   - Verify staging uses appropriate retrievers
   - Check for production-ready retrievers
   - Validate retriever configuration

2. **Retriever Performance Test**:
   - Test retriever performance
   - Check for timeout errors
   - Validate retriever functionality

### 🔧 Staging Validation Implementation

#### Test Script Structure
```bash
# Test staging configuration
STAGING_CONFIG=$(curl -s "$STAGING_AGENT/config")

# Validate environment
APP_ENV=$(echo "$STAGING_CONFIG" | jq -r '.appEnv')

# Validate retriever
RETRIEVER_PROVIDER=$(echo "$STAGING_CONFIG" | jq -r '.retrieverProvider')
```

#### Staging Validation Logic
```bash
# Validate staging environment
if [ "$APP_ENV" == "staging" ]; then
  echo "✅ Staging environment is properly configured"
else
  echo "❌ Staging environment is not properly configured"
  exit 1
fi
```

---

## Test Configuration

### ⚙️ Test Configuration Overview

#### Environment Variables
```bash
# Test configuration
TEST_TIMEOUT=30000
RETRY_ATTEMPTS=3
RETRY_DELAY=5000

# Service URLs
PRODUCTION_FRONTEND=https://chef-chopsky-production.vercel.app
PRODUCTION_AGENT=https://chef-chopsky-production.up.railway.app
STAGING_FRONTEND=https://chef-chopsky-git-staging.vercel.app
STAGING_AGENT=https://chef-chopsky-staging.up.railway.app

# Test data
TEST_USER_ID=test-user-123
TEST_CONVERSATION_ID=test-conversation-456
```

#### Test Thresholds
```bash
# Response time thresholds
FRONTEND_MAX_RESPONSE_TIME=3
AGENT_MAX_RESPONSE_TIME=5
DATABASE_MAX_RESPONSE_TIME=2

# Health check thresholds
HEALTH_CHECK_TIMEOUT=30
HEALTH_CHECK_RETRIES=3
```

### 🔧 Test Configuration Setup

#### GitHub Secrets Configuration
| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `ALERT_WEBHOOK_URL` | Webhook for test notifications | Test notifications |
| `PRODUCTION_SUPABASE_URL` | Production database URL | Production tests |
| `PRODUCTION_SUPABASE_PUBLISHABLE_KEY` | Production anon key | Production tests |
| `PRODUCTION_SUPABASE_SECRET_KEY` | Production service key | Production tests |
| `STAGING_SUPABASE_URL` | Staging database URL | Staging tests |
| `STAGING_SUPABASE_PUBLISHABLE_KEY` | Staging anon key | Staging tests |
| `STAGING_SUPABASE_SECRET_KEY` | Staging service key | Staging tests |
| `PRODUCTION_OPENAI_API_KEY` | Production OpenAI key | Production tests |
| `STAGING_OPENAI_API_KEY` | Staging OpenAI key | Staging tests |
| `LANGCHAIN_API_KEY` | LangSmith API key | All tests |

---

## Test Execution

### 🚀 Test Execution Overview

#### Test Triggers
- **Push to main**: Full test suite
- **Push to staging**: Staging tests
- **Push to feat/**: Feature tests
- **Pull Request**: Full test suite
- **Schedule**: Health checks every hour
- **Manual**: On-demand testing

#### Test Execution Flow
1. **Health Checks**: Test all service health
2. **Environment Separation**: Validate environment isolation
3. **Production Validation**: Test production-specific requirements
4. **Staging Validation**: Test staging-specific requirements
5. **Test Summary**: Generate test results summary
6. **Notifications**: Send test result notifications

### 📋 Test Execution Procedures

#### Automated Test Execution
1. **GitHub Actions Workflow**:
   - Triggers on push/PR
   - Runs all test categories
   - Generates test reports
   - Sends notifications

2. **Scheduled Test Execution**:
   - Runs every hour
   - Focuses on health checks
   - Monitors service status
   - Alerts on failures

#### Manual Test Execution
1. **Local Test Execution**:
   - Run tests locally
   - Debug test issues
   - Validate test changes
   - Test new test cases

2. **Manual Workflow Execution**:
   - Trigger workflow manually
   - Test specific test types
   - Validate test configuration
   - Debug test failures

### 🔧 Test Execution Implementation

#### Test Execution Commands
```bash
# Run health check workflow
gh workflow run health-checks-and-environment-separation-tests.yml

# Check workflow status
gh run list --workflow=health-checks-and-environment-separation-tests.yml

# View workflow logs
gh run view [RUN_ID] --log

# Run local health checks
npm run health:check
```

#### Test Execution Validation
```bash
# Validate test execution
if [ "$TEST_RESULT" == "success" ]; then
  echo "✅ All tests passed"
else
  echo "❌ Some tests failed"
  exit 1
fi
```

---

## Test Monitoring

### 📊 Test Monitoring Overview

#### Monitoring Objectives
- Track test execution results
- Monitor test performance
- Alert on test failures
- Analyze test trends

#### Monitoring Coverage
- **Test Results**: Success/failure rates
- **Test Performance**: Execution times
- **Test Coverage**: Test coverage metrics
- **Test Trends**: Historical test data

### 📋 Test Monitoring Procedures

#### Test Result Monitoring
1. **Success Rate Monitoring**:
   - Track test success rates
   - Monitor test failure patterns
   - Alert on test failures
   - Analyze failure causes

2. **Performance Monitoring**:
   - Track test execution times
   - Monitor test performance trends
   - Alert on performance degradation
   - Optimize test performance

#### Test Coverage Monitoring
1. **Coverage Tracking**:
   - Track test coverage metrics
   - Monitor coverage trends
   - Alert on coverage drops
   - Improve test coverage

2. **Coverage Analysis**:
   - Analyze coverage gaps
   - Identify untested areas
   - Plan coverage improvements
   - Track coverage progress

### 🔧 Test Monitoring Implementation

#### Monitoring Configuration
```bash
# Test monitoring settings
TEST_MONITORING_ENABLED=true
TEST_ALERT_WEBHOOK_URL=${{ secrets.ALERT_WEBHOOK_URL }}
TEST_MONITORING_FREQUENCY=hourly
TEST_MONITORING_RETENTION=30d
```

#### Monitoring Alerts
```bash
# Test failure alerts
if [ "$TEST_RESULT" == "failure" ]; then
  curl -X POST "$ALERT_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{"text": "❌ Health checks and environment separation tests failed"}'
fi
```

---

## Test Maintenance

### 🔧 Test Maintenance Overview

#### Maintenance Objectives
- Keep tests current and relevant
- Maintain test performance
- Update test coverage
- Improve test reliability

#### Maintenance Schedule
- **Daily**: Monitor test results
- **Weekly**: Review test performance
- **Monthly**: Update test coverage
- **Quarterly**: Review test strategy

### 📋 Test Maintenance Procedures

#### Test Updates
1. **Test Case Updates**:
   - Update test cases for new features
   - Remove obsolete test cases
   - Improve test coverage
   - Optimize test performance

2. **Test Configuration Updates**:
   - Update test thresholds
   - Modify test parameters
   - Adjust test schedules
   - Update test dependencies

#### Test Performance Optimization
1. **Performance Analysis**:
   - Analyze test execution times
   - Identify performance bottlenecks
   - Optimize test execution
   - Improve test efficiency

2. **Performance Improvements**:
   - Parallelize test execution
   - Optimize test data
   - Improve test reliability
   - Reduce test flakiness

### 🔧 Test Maintenance Implementation

#### Maintenance Commands
```bash
# Update test dependencies
npm update

# Run test performance analysis
npm run test:performance

# Update test coverage
npm run test:coverage

# Optimize test execution
npm run test:optimize
```

#### Maintenance Validation
```bash
# Validate test maintenance
if [ "$TEST_MAINTENANCE_STATUS" == "success" ]; then
  echo "✅ Test maintenance completed successfully"
else
  echo "❌ Test maintenance failed"
  exit 1
fi
```

---

## Troubleshooting

### 🔍 Common Test Issues

#### Test Execution Issues
- **Test Failures**: Check service status, verify configuration
- **Timeout Errors**: Increase timeout values, check network connectivity
- **Configuration Errors**: Verify environment variables, check secrets
- **Permission Errors**: Check API keys, verify access permissions

#### Test Performance Issues
- **Slow Tests**: Optimize test execution, parallelize tests
- **Flaky Tests**: Improve test reliability, add retry logic
- **Resource Issues**: Check resource usage, optimize test data
- **Network Issues**: Check network connectivity, verify service URLs

### 🛠️ Troubleshooting Tools

#### Debugging Commands
```bash
# Debug test execution
npm run test:debug

# Check test configuration
npm run test:config

# Validate test environment
npm run test:validate

# Test specific components
npm run test:component -- --component=health-checks
```

#### Debugging Procedures
1. **Test Execution Debugging**:
   - Check test logs
   - Verify test configuration
   - Test individual components
   - Debug test failures

2. **Test Performance Debugging**:
   - Analyze test execution times
   - Identify performance bottlenecks
   - Optimize test execution
   - Improve test reliability

---

*This testing guide should be reviewed and updated regularly to reflect changes in testing requirements, procedures, and tools.*
