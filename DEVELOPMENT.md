# Chef Chopsky Development Guide

This guide covers how to set up, run, and test the Chef Chopsky application locally and in CI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+
- Git

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd chef-chopsky

# Install all dependencies
npm run install:all

# Copy environment files
cp frontend/.env.example frontend/.env.local
cp agent/.env.example agent/.env.local

# Edit environment files with your API keys
# frontend/.env.local - Add Supabase credentials
# agent/.env.local - Add OpenAI API key and LangSmith credentials
```

## 🛠️ Development Commands

### Start All Services
```bash
# Start both frontend and agent services simultaneously
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000 (Next.js)
- **Agent**: http://localhost:3001 (Express + LangChain)

### Individual Service Commands
```bash
# Frontend only
npm run dev:frontend

# Agent only  
npm run dev:agent

# Stop all services
npm run stop:services
```

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
npm run test

# Frontend unit tests only
npm run test:frontend

# Agent unit tests only
npm run test:agent
```

### Integration Tests
```bash
# Run integration tests (requires services to be running)
npm run test:integration

# Run integration tests with automatic service health check
npm run test:integration:with-services
```

### End-to-End Tests
```bash
# Run E2E tests (requires services to be running)
npm run test:e2e

# Run E2E tests with automatic service health check
npm run test:e2e:with-services

# Run E2E tests with UI
npm run test:e2e:ui
```

### All Tests
```bash
# Run all tests (unit + integration + e2e)
npm run test:all

# Run all tests with automatic service health check
npm run test:all:with-services
```

## 🔍 Service Health Checks

### Manual Health Check
```bash
# Check if all services are running
npm run health:check

# Check only frontend
node scripts/health-check.js --frontend

# Check only agent
node scripts/health-check.js --agent
```

### Health Check Endpoints
- **Frontend**: http://localhost:3000/
- **Agent**: http://localhost:3001/health

## 🏗️ Building

```bash
# Build all applications
npm run build

# Build frontend only
npm run build:frontend

# Build agent only
npm run build:agent
```

## 🔧 Linting

```bash
# Lint all code
npm run lint

# Lint frontend only
npm run lint:frontend

# Lint agent only
npm run lint:agent
```

## 🧹 Cleanup

```bash
# Remove all node_modules and build artifacts
npm run clean
```

## 🚀 CI/CD

### GitHub Actions
The repository includes a comprehensive CI workflow (`.github/workflows/ci.yml`) that:

1. **Runs on**: Push/PR to main/develop branches
2. **Tests on**: Node.js 18.x and 20.x
3. **Steps**:
   - Install dependencies
   - Lint code
   - Run unit tests
   - Build applications
   - Start services
   - Run integration tests
   - Run E2E tests
   - Upload test results

### Local CI Simulation
```bash
# Run the same tests as CI
npm run test:ci
```

## 📁 Project Structure

```
chef-chopsky/
├── frontend/                 # Next.js frontend application
│   ├── app/                  # App Router pages and API routes
│   ├── components/           # React components
│   ├── tests/                # Test suites
│   │   ├── e2e/             # Playwright E2E tests
│   │   └── integration/     # Jest integration tests
│   └── package.json
├── agent/                    # LangChain agent service
│   ├── src/                  # Source code
│   ├── tests/                # Agent tests
│   └── package.json
├── scripts/                  # Utility scripts
│   └── health-check.js       # Service health checker
├── .github/workflows/        # CI/CD workflows
└── package.json              # Root package.json with dev scripts
```

## 🔑 Environment Variables

### Frontend (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Agent Service
AGENT_SERVICE_URL=http://localhost:3001
```

### Agent (.env.local)
```bash
# OpenAI
OPENAI_API_KEY=your_openai_key

# LangSmith (optional)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=chef chopsky
LANGCHAIN_API_KEY=your_langsmith_key

# Server
PORT=3001
```

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :3001

# Kill processes using the ports
kill -9 $(lsof -t -i:3000)
kill -9 $(lsof -t -i:3001)
```

### Integration Tests Failing
```bash
# Make sure services are running
npm run health:check

# If services aren't running, start them
npm run dev

# Then run tests
npm run test:integration:with-services
```

### E2E Tests Failing
```bash
# Install Playwright browsers
cd frontend && npx playwright install

# Run with headed mode to see what's happening
npm run test:e2e:headed
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [LangChain Documentation](https://python.langchain.com/docs/get_started/introduction)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:all:with-services`
5. Submit a pull request

The CI will automatically run all tests and checks on your PR.
