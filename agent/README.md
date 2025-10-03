# Chef Chopsky Agent Service

A standalone Node.js service that provides HTTP API access to the Chef Chopsky LangChain agent. This service processes cooking-related chat messages and returns AI-generated responses.

## Overview

The Agent Service is designed to run separately from the frontend application, providing a clean separation between web serving and AI processing. This architecture allows for independent scaling and avoids bundling heavy LangChain dependencies in the web application.

## Features

- **LangChain Integration**: Full integration with LangGraph retrieval agent
- **HTTP API**: RESTful endpoints for chat processing
- **LangSmith Tracing**: Built-in observability and tracing
- **CORS Support**: Cross-origin requests for frontend integration
- **Error Handling**: Comprehensive error handling and validation
- **Health Checks**: Monitoring endpoints for service health

## API Endpoints

### Health Check
```
GET /health
```

Returns service status and metadata.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-11T17:12:34.550Z",
  "service": "chef-chopsky-agent",
  "version": "1.0.0"
}
```

### Chat Processing
```
POST /chat
```

Processes chat messages and returns AI responses.

**Request:**
```json
{
  "conversation_id": "uuid-string",
  "messages": [
    {
      "role": "user",
      "content": "Give me a high-protein plant-based dinner idea"
    }
  ],
  "client_metadata": {
    "user_agent": "web-client",
    "timestamp": "2025-09-11T17:12:34.550Z"
  }
}
```

**Response:**
```json
{
  "assistant_message": {
    "id": "uuid-string",
    "role": "assistant",
    "content": "How about a quinoa and kale stir-fry...",
    "model": "openai/gpt-4o-mini",
    "usage": {
      "prompt_tokens": 0,
      "completion_tokens": 0,
      "total_tokens": 0
    }
  },
  "timing_ms": 3985
}
```

## Environment Setup

### Required Environment Variables

Create a `.env` file in the `agent/` directory with the following variables:

```bash
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# LangSmith Configuration (optional but recommended)
LANGCHAIN_TRACING=true
LANGCHAIN_PROJECT=chef chopsky
LANGCHAIN_API_KEY=your_langsmith_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS in production)
FRONTEND_URL=http://localhost:3000
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your actual API keys.

## Running the Service

### Development Mode
```bash
npm run server:dev
```

This runs the server with file watching for automatic restarts.

### Production Mode
```bash
npm run server
```

### Background Process
```bash
npm run server &
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Server Tests Only
```bash
npm test -- --testPathPattern=server.test.ts
```

### Run Agent Tests Only
```bash
npm test -- --testPathPattern=agent.test.ts
```

### Test Coverage
```bash
npm run test:coverage
```

## Development Workflow

### Local Development
1. Start the agent service:
   ```bash
   cd agent
   npm run server:dev
   ```

2. In another terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. The agent service will be available at `http://localhost:3001`
4. The frontend will be available at `http://localhost:3000`

### Testing the API

You can test the API using curl:

```bash
# Health check
curl http://localhost:3001/health

# Chat request
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "test-123",
    "messages": [
      {
        "role": "user",
        "content": "Give me a simple dinner idea"
      }
    ]
  }'
```

## Architecture

### Service Structure
```
agent/
├── src/
│   ├── server.ts              # Express server setup
│   ├── config/
│   │   └── index.ts           # Configuration management
│   ├── retrieval_graph/       # LangChain agent implementation
│   └── __tests__/
│       ├── server.test.ts     # Server API tests
│       └── agent.test.ts      # Agent functionality tests
├── package.json
├── .env.example
└── README.md
```

### Integration Pattern
1. Frontend sends HTTP request to Next.js API route
2. Next.js API route calls Agent Service via HTTP
3. Agent Service processes with LangChain/LangGraph
4. Agent Service returns response to Next.js
5. Next.js persists messages and returns to frontend

## Error Handling

The service includes comprehensive error handling:

- **400 Bad Request**: Invalid request format or missing required fields
- **500 Internal Server Error**: Agent processing failures or server errors
- **404 Not Found**: Unknown endpoints

All errors include descriptive messages and timing information.

## Monitoring and Observability

### LangSmith Integration
- All agent runs are automatically traced
- Project: "chef chopsky"
- Tags: ["web", "agent", environment, model]
- Metadata: conversation_id, message_id, user_id, model, latency_ms

### Logging
- Request logging for all endpoints
- Error logging with stack traces
- Timing information for performance monitoring

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Ensure you're using `tsx` instead of `ts-node`
   - Check that all dependencies are installed

2. **CORS errors**
   - Verify the frontend URL is correct in environment variables
   - Check that the agent service is running on the expected port

3. **OpenAI API errors**
   - Verify your API key is correct and has sufficient credits
   - Check that the API key has access to the required models

4. **LangSmith tracing not working**
   - Verify LangSmith environment variables are set
   - Check that the API key has access to the project

### Debug Mode
Set `NODE_ENV=development` for more detailed error messages and logging.

## Contributing

1. Make changes to the code
2. Run tests to ensure nothing is broken
3. Test the API endpoints manually
4. Update documentation if needed
5. Commit and push changes

## License

MIT License - see LICENSE file for details.
```# Force redeploy Fri Oct  3 17:29:33 EDT 2025
