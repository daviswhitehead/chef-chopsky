# Local CI Testing with Act

This directory contains tools and configuration for running GitHub Actions workflows locally using Act.

## Quick Start

### Run E2E Tests Directly (Recommended)
```bash
# Run E2E tests without dependencies (fastest)
./scripts/run-e2e-direct.sh
```

### Run E2E Tests with Dependencies
```bash
# Run E2E tests with full CI workflow
./scripts/run-e2e-local.sh
```

## Files

### Configuration Files
- **`.actrc`** - Act configuration file
- **`env.ci`** - Combined environment variables for frontend and agent services
- **`ci-e2e-only.yml`** - E2E-only workflow (no dependencies)

### Scripts
- **`run-e2e-direct.sh`** - Run E2E tests directly (bypasses dependencies)
- **`run-e2e-local.sh`** - Run E2E tests with full CI workflow

## Environment Variables

The `env.ci` file contains all necessary environment variables:

```bash
# Required for AI functionality
OPENAI_API_KEY=sk-test-key-placeholder-replace-with-real-key

# Supabase configuration (local instance)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service URLs
AGENT_SERVICE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

## Troubleshooting

### Port Conflicts
If you get `EADDRINUSE` errors:
```bash
# Clean up existing processes
pkill -f 'next dev'
pkill -f 'tsx.*server'
pkill -f 'npm run dev'
pkill -f 'npm run server'
```

### Service Startup Issues
The startup script (`scripts/start-services.sh`) includes cleanup and health checks:
- Cleans up existing processes
- Starts frontend and agent services
- Waits for services to be healthy
- Provides detailed logging

### Act Configuration
The `.actrc` file configures:
- Ubuntu runner image
- Verbose logging (`-v`)
- Environment file (`--env-file .github/testing/env.ci`)
- Apple M-series compatibility (`--container-architecture linux/amd64`)

## Workflow Differences

### Original CI Workflow (`ci.yml`)
- Has dependencies: `needs: [code-quality, integration-tests-agent, integration-tests-frontend]`
- Runs integration tests first
- Takes longer but ensures full CI pipeline

### E2E-Only Workflow (`ci-e2e-only.yml`)
- No dependencies: runs E2E tests directly
- Faster feedback loop
- Good for debugging E2E test issues

## Usage Examples

### Debug E2E Test Failures
```bash
# Quick E2E test run for debugging
./scripts/run-e2e-direct.sh
```

### Full CI Simulation
```bash
# Run complete CI workflow locally
act -W .github/workflows/ci.yml -j e2e --matrix shard:1/1 -v --env-file .github/testing/env.ci --container-architecture linux/amd64
```

### Test Specific Shard
```bash
# Test specific shard (1/3, 2/3, or 3/3)
act -W .github/workflows/ci-e2e-only.yml -j e2e --matrix shard:2/3 -v --env-file .github/testing/env.ci --container-architecture linux/amd64
```

## Benefits

1. **Faster Feedback Loop** - Test E2E changes locally before pushing
2. **Debug Capability** - Access to all logs and service status
3. **Environment Consistency** - Same environment as CI
4. **No GitHub API Limits** - Run as many times as needed
5. **Offline Development** - Work without internet connection

## Next Steps

1. Replace `OPENAI_API_KEY` placeholder with real key for actual testing
2. Use `./scripts/run-e2e-direct.sh` for quick E2E test iterations
3. Use `./scripts/run-e2e-local.sh` for full CI simulation
4. Monitor service logs in `/tmp/chef-chopsky-services.log` for debugging