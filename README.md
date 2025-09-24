# Chef Chopski - AI Sous Chef with Conversation Monitoring

Chef Chopski is an AI-powered sous chef that helps with CSA-based meal planning, high-protein plant-based recipes, and longevity-focused cooking. This application extends beyond a simple custom GPT by providing comprehensive conversation tracking, feedback collection, and monitoring capabilities.

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js + React + TypeScript
- **Agent Service**: Node.js + Express + LangChain/LangGraph
- **Database**: Supabase (PostgreSQL)
- **AI Provider**: OpenAI GPT-5-nano
- **Styling**: Tailwind CSS
- **Testing**: Jest (unit/integration) + Playwright (E2E)
- **Observability**: LangSmith tracing

### Key Features
1. **Conversation Tracking**: All user-AI interactions are stored with detailed metadata
2. **Feedback System**: User satisfaction tracking with tags and comments
3. **Review Dashboard**: Web interface for manually reviewing conversations
4. **Performance Metrics**: Track key success indicators over time
5. **Scalable Architecture**: Designed to support multiple users and AI providers

## Project Structure

```
chef-chopsky/
├── frontend/               # Next.js React application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/               # Database and AI services
│   ├── tests/             # Test suites (unit, integration, E2E)
│   ├── supabase/          # Database migrations
│   └── package.json
├── agent/                 # Standalone Node.js agent service
│   ├── src/               # Agent service source code
│   │   ├── server.ts      # Express server
│   │   ├── config/        # Configuration management
│   │   └── retrieval_graph/ # LangChain agent implementation
│   ├── tests/             # Agent service tests
│   └── package.json
├── ai/                    # Original custom GPT configuration
├── scripts/               # Development and testing scripts
├── documentation/         # Project documentation
└── package.json           # Root package.json with workspace scripts
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- Supabase account (free tier)
- OpenAI API key

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd chef-chopsky
npm run install:all
```

### 2. Database Setup (Supabase)
1. Create a Supabase account at https://supabase.com/
2. Create a new project named "chef-chopsky"
3. Go to SQL Editor in your Supabase dashboard
4. Copy and paste the contents of `backend/src/database/schema.sql`
5. Click "Run" to execute the schema

### 3. Environment Configuration

#### Automated Setup (Recommended)
```bash
# Run the automated setup script
npm run setup

# This will:
# - Create frontend/.env.local from example
# - Create agent/.env from example  
# - Check for placeholder values
# - Guide you through configuration
# - Warn if agent will run in mock mode
```

⚠️ **CRITICAL**: The setup script will warn you if the agent will run in mock mode. You MUST set a real OpenAI API key to get real AI responses instead of fake ones!

#### Manual Setup
1. Copy `frontend/.env.example` to `frontend/.env.local`
2. Update the environment variables:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   
   # Agent Service Configuration
   AGENT_SERVICE_URL=http://localhost:3001
   ```

#### Agent Environment (`agent/.env`)
1. Copy `agent/.env.example` to `agent/.env`
2. Update the environment variables:
   ```bash
   # Required: OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key_here
   
   # LangSmith Configuration (Optional)
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_PROJECT=chef chopsky
   LANGCHAIN_API_KEY=your_langsmith_api_key_here
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Frontend URL for CORS
   FRONTEND_URL=http://localhost:3000
   ```

#### Required API Keys
- **OpenAI API Key**: Required for AI functionality
- **Supabase**: Required for database operations
- **LangSmith API Key**: Optional, for enhanced observability

### 4. Start Development Servers

#### Option 1: Start Both Services Together (Recommended)
```bash
# Start both frontend and agent services
npm run dev

# This will start:
# - Frontend: http://localhost:3000
# - Agent Service: http://localhost:3001
```

#### Option 2: Start Services Separately
```bash
# Terminal 1: Start frontend
npm run dev:frontend

# Terminal 2: Start agent service
npm run dev:agent
```

#### Verify Services Are Running
```bash
# Check health of both services
npm run health:check

# Or test individually:
curl http://localhost:3000  # Frontend
curl http://localhost:3001/health  # Agent service
```

## API Endpoints

### Frontend API Routes (Next.js)
- `POST /api/ai/chat` - Proxy to agent service for AI responses
- `GET /api/conversations/:id` - Get conversation details
- `GET /api/conversations/:id/messages` - Get conversation messages

### Agent Service API (Node.js/Express)
- `GET /health` - Service health check
- `POST /chat` - Process chat messages with LangChain agent

### Database Operations
All database operations (conversations, messages, feedback) are handled through Supabase client in the frontend.

## Usage

### Starting a Conversation
1. Navigate to the dashboard at `http://localhost:3000`
2. Click "New Conversation"
3. Fill in conversation details (title, CSA items, dietary preferences)
4. Start chatting with Chef Chopsky

### Reviewing Conversations
1. View all conversations on the dashboard
2. Click "View" on any conversation to see the full exchange
3. Submit feedback after completing a conversation

### Monitoring Quality
- Track satisfaction scores over time
- Review conversation metadata (tokens used, processing time)
- Analyze feedback patterns and tags

## Deployment

### Frontend Deployment (Vercel)
1. Connect your repository to Vercel
2. Configure environment variables (Supabase and OpenAI)
3. Deploy

## Future Enhancements

### Phase 2: Advanced Monitoring
- Automated conversation quality scoring
- A/B testing different AI prompts
- Integration with multiple AI providers
- Real-time conversation analytics

### Phase 3: Mobile App
- React Native mobile application
- Offline conversation caching
- Push notifications for meal reminders

### Phase 4: Advanced Features
- Recipe recommendation engine
- Nutritional analysis
- Meal planning calendar integration
- Social sharing features

## Testing

### Test Execution Requirements

The project includes comprehensive testing at multiple levels:

#### Prerequisites
- **Node.js 18+** (required for all tests)
- **Both services running** (for E2E and integration tests):
  - Frontend: `http://localhost:3000`
  - Agent Service: `http://localhost:3001`
- **Environment variables** configured (see Environment Setup section)
- **Supabase test database** (for E2E tests)

#### Test Types

**1. Unit Tests**
- Frontend: Jest tests for components and utilities
- Agent: Jest tests for agent functionality and server endpoints
- **Run time**: ~5-10 seconds
- **Requirements**: No services needed

**2. Integration Tests**
- Cross-service communication tests
- API route validation tests
- Service configuration tests
- **Run time**: ~3-5 seconds
- **Requirements**: Services must be running

**3. End-to-End Tests**
- Full user journey tests with Playwright
- Browser automation testing
- **Run time**: ~3-5 minutes
- **Requirements**: Both services + Supabase test database

### Running Tests

#### Quick Test Commands (from root directory)

```bash
# Run all tests (unit + integration + E2E)
npm run test:all

# Run only unit tests
npm test

# Run only integration tests
npm run test:integration

# Run only E2E tests
npm run test:e2e

# Run tests with automatic service startup
npm run test:all:with-services
```

#### Individual Service Tests

```bash
# Frontend tests only
npm run test:frontend

# Agent tests only
npm run test:agent
```

#### Advanced Test Commands

```bash
# Integration tests with specific patterns
npm run test:integration:frontend    # Frontend service tests only
npm run test:integration:agent      # Agent service tests only
npm run test:integration:communication  # Cross-service tests

# E2E tests with different modes
npm run test:e2e:ui        # Interactive UI mode
npm run test:e2e:headed    # Run with browser visible
npm run test:e2e:debug     # Debug mode with breakpoints
```

#### Test Setup for Local Development

1. **Start both services**:
   ```bash
   npm run dev
   # This starts both frontend (port 3000) and agent (port 3001)
   ```

2. **Verify services are running**:
   ```bash
   npm run health:check
   ```

3. **Run tests**:
   ```bash
   # Run all tests
   npm run test:all
   
   # Or run specific test types
   npm run test:integration
   npm run test:e2e
   ```

#### CI/CD Testing

The project includes automated testing via GitHub Actions:

- **Unit Tests**: Run on every PR
- **Integration Tests**: Run on every PR (32/32 tests passing)
- **E2E Tests**: Run on every PR (29/29 tests passing)
- **Auto-Fix System**: Automatically resolves CI failures

### Test Configuration

#### E2E Test Configuration
- **Browser**: Chromium (headless in CI, headed locally)
- **Timeout**: 2 minutes per test
- **Retries**: 2 retries on CI, 0 locally
- **Workers**: 1 worker on CI, 2 workers locally
- **Traces**: Captured on first retry only

#### Integration Test Configuration
- **Timeout**: 15 seconds per test
- **Workers**: 1 worker (sequential execution)
- **Coverage**: HTML and LCOV reports generated
- **Environment**: Node.js test environment

### Troubleshooting Tests

#### Common Issues

1. **Services not running**
   ```bash
   # Check if services are running
   npm run health:check
   
   # Start services if needed
   npm run dev
   ```

2. **Port conflicts**
   - Frontend: `http://localhost:3000`
   - Agent: `http://localhost:3001`
   - Ensure these ports are available

3. **Environment variables missing**
   - Check `.env` files in both `frontend/` and `agent/` directories
   - Verify Supabase credentials for E2E tests

4. **Test timeouts**
   - E2E tests: 2 minutes timeout
   - Integration tests: 15 seconds timeout
   - Increase timeouts if running on slower machines

#### Debug Mode

```bash
# Run E2E tests in debug mode
npm run test:e2e:debug

# Run integration tests with verbose output
npm run test:integration -- --verbose

# Run specific test file
npm run test:e2e -- tests/e2e/chat-flow.spec.ts
```

## Development Workflow

### Daily Development

1. **Start your development environment**:
   ```bash
   # Start both services
   npm run dev
   
   # Verify services are running
   npm run health:check
   ```

2. **Make your changes**:
   - Frontend changes: Edit files in `frontend/`
   - Agent changes: Edit files in `agent/`
   - Both services will auto-reload on changes

3. **Test your changes**:
   ```bash
   # Run all tests
   npm run test:all
   
   # Or run specific test types
   npm run test:integration  # Fast integration tests
   npm run test:e2e         # Full E2E tests
   ```

4. **Before committing**:
   ```bash
   npm run lint           # Check code style
   npm run type-check     # Check TypeScript
   npm run test:all       # Run all tests
   ```

### Service-Specific Development

#### Frontend Development
```bash
cd frontend
npm run dev              # Start frontend only
npm test                 # Run frontend unit tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run E2E tests
```

#### Agent Service Development
```bash
cd agent
npm run server:dev       # Start agent service only
npm test                 # Run agent tests
npm run test:coverage    # Run tests with coverage
```

### Debugging

#### Frontend Debugging
```bash
# Debug E2E tests
npm run test:e2e:debug

# Run with browser visible
npm run test:e2e:headed

# Interactive test UI
npm run test:e2e:ui
```

#### Agent Service Debugging
```bash
# Test agent API directly
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"conversation_id": "test", "messages": [{"role": "user", "content": "Hello"}]}'

# Check service health
curl http://localhost:3001/health
```

### Environment Management

#### Local Development
- Use `.env.local` for frontend
- Use `.env` for agent service
- Both services run on localhost

#### Testing Environment
- E2E tests use Supabase test database
- Integration tests use local services
- All tests run in isolated environments

### Code Quality

#### Linting and Formatting
```bash
npm run lint             # Check all code
npm run lint:frontend    # Frontend only
npm run lint:agent       # Agent only
```

#### Type Checking
```bash
npm run type-check       # Check all TypeScript
npm run type-check:frontend  # Frontend only
npm run type-check:agent     # Agent only
```

### Troubleshooting

#### Services Won't Start
```bash
# Check if ports are in use
lsof -i :3000  # Frontend port
lsof -i :3001  # Agent port

# Kill processes if needed
npm run stop:services
```

#### Tests Failing
```bash
# Check service health
npm run health:check

# Run tests with verbose output
npm run test:integration -- --verbose
npm run test:e2e -- --verbose
```

#### Database Issues
- Verify Supabase credentials in `.env.local`
- Check Supabase project is active
- Ensure database migrations are applied

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the development workflow above
4. **Run tests**: `npm run test:all`
5. Ensure all tests pass (unit, integration, E2E)
6. Submit a pull request

### Pull Request Process

1. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** following the development workflow

3. **Test thoroughly**:
   ```bash
   npm run test:all
   npm run lint
   npm run type-check
   ```

4. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve issue"
   git commit -m "test: add test coverage"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### CI/CD Integration

The project includes automated CI/CD via GitHub Actions:

- **Automatic Testing**: All tests run on every PR
- **Code Quality**: Linting and type checking
- **Auto-Fix System**: Automatically resolves CI failures
- **Deployment**: Ready for production deployment

## License

This project is licensed under the MIT License - see the LICENSE file for details.