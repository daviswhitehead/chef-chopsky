import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { graph } from './retrieval_graph/graph.js';
import { ensureConfiguration } from './retrieval_graph/configuration.js';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { v4 as uuidv4 } from 'uuid';

// Fix SSL certificate issues in development
if (config.nodeEnv === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('🔧 Development mode: SSL certificate validation disabled');
}

// Handle unhandled errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Generate a mock response for testing purposes
 */
function generateMockResponse(userMessage: string): string {
  const responses = [
    "I'd be happy to help you with that! Based on your question, here are some suggestions...",
    "That's a great question! Let me provide you with some helpful information about that topic.",
    "I understand you're looking for guidance on this. Here's what I recommend...",
    "Thanks for asking! Here's my response to help you with your request.",
    "I can definitely help you with that. Let me share some insights and recommendations."
  ];
  
  // Add some context-aware responses based on keywords
  if (userMessage.toLowerCase().includes('cook') || userMessage.toLowerCase().includes('recipe')) {
    return "I'd love to help you with cooking! Here are some delicious recipe suggestions and cooking tips that should work well for your needs.";
  }
  
  if (userMessage.toLowerCase().includes('dinner')) {
    return "For dinner tonight, I recommend something hearty and satisfying. Here are some great dinner ideas that are both delicious and easy to prepare.";
  }
  
  if (userMessage.toLowerCase().includes('ingredients')) {
    return "Let me help you with those ingredients! Here's what you'll need and some great ways to use them in your cooking.";
  }
  
  // Return a random response for other cases
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Chef Chopsky Agent Service
 * 
 * Express server that provides HTTP API for the LangChain agent.
 * This service runs separately from the frontend and handles AI processing.
 */

const app = express();

// Environment validation is now handled in config/index.ts
console.log('🔧 Agent Service Startup Validation...');
console.log('✅ Environment validation complete');

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'http://localhost:3000'
    : '*', // Allow all origins in development for testing
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'chef-chopsky-agent',
    version: '1.0.0'
  });
});

// Chat endpoint
app.post('/chat', (req, res) => {
  const startTime = Date.now();
  const messageId = uuidv4();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[${requestId}] 🚀 POST /chat - Request started at ${new Date().toISOString()}`);
  
  (async () => {
    try {
    // Validate request
    const { conversation_id, messages, client_metadata } = req.body;
    
    console.log(`[${requestId}] 📝 Request body parsed:`, {
      conversation_id,
      messagesCount: messages?.length,
      client_metadata,
      lastMessage: messages?.[messages.length - 1]
    });
    
    if (!conversation_id || !messages || !Array.isArray(messages) || messages.length === 0) {
      console.log(`[${requestId}] ❌ Validation failed: missing required fields`);
      return res.status(400).json({
        error: 'Invalid request',
        message: 'conversation_id and non-empty messages array are required'
      });
    }
    
    console.log(`[${requestId}] ✅ Request validation passed`);

    // Convert messages to LangChain format
    console.log(`[${requestId}] 🔄 Converting ${messages.length} messages to LangChain format`);
    const langchainMessages = messages.map((msg: { role: string; content: string }) => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else if (msg.role === 'assistant') {
        return new AIMessage(msg.content);
      }
      throw new Error(`Unsupported message role: ${msg.role}`);
    });
    console.log(`[${requestId}] ✅ Messages converted to LangChain format`);

    // Create configuration using environment-driven settings
    console.log(`[${requestId}] ⚙️ Creating agent configuration`);
    const agentConfig = ensureConfiguration({
      configurable: {
        userId: conversation_id, // Use conversation_id as userId for now
        embeddingModel: config.embeddingModel, // Use environment-driven embedding model
        retrieverProvider: config.retrieverProvider, // Use environment-driven retriever provider
        searchKwargs: {},
        responseModel: 'openai/gpt-5-nano',
        queryModel: 'openai/gpt-5-nano'
      }
    });
    console.log(`[${requestId}] ✅ Agent configuration created with:`, {
      retrieverProvider: config.retrieverProvider,
      embeddingModel: config.embeddingModel,
      appEnv: config.appEnv
    });

    // Check if we're in mock mode (for local testing with test-key or missing key)
    const isMockMode = config.openaiApiKey === 'test-key' || !config.openaiApiKey || config.openaiApiKey === 'your_openai_api_key_here';
    
    if (isMockMode) {
      if (config.nodeEnv === 'production') {
        console.error(`[${requestId}] 🚨 CRITICAL ERROR: Cannot process requests in production with invalid OpenAI API key!`);
        console.error(`[${requestId}] 🚨 Production environment requires a valid OPENAI_API_KEY`);
        console.error(`[${requestId}] 🚨 Current API key: ${config.openaiApiKey ? 'Set but invalid' : 'Not set'}`);
        console.error(`[${requestId}] 🚨 This is a CRITICAL configuration error that must be fixed immediately.`);
        
        return res.status(500).json({
          error: 'CRITICAL CONFIGURATION ERROR',
          message: 'Production environment requires valid OpenAI API key. Service cannot process requests.',
          details: 'OPENAI_API_KEY is missing or invalid in production environment',
          timing_ms: Date.now() - startTime
        });
      } else {
        console.warn(`[${requestId}] ⚠️  WARNING: Agent service is running in MOCK MODE!`);
        console.warn(`[${requestId}] ⚠️  This means you're getting fake responses instead of real AI responses.`);
        console.warn(`[${requestId}] ⚠️  To fix this, set a valid OPENAI_API_KEY in your agent/.env file.`);
        console.warn(`[${requestId}] ⚠️  Current API key: ${config.openaiApiKey ? 'Set but invalid' : 'Not set'}`);
        console.log(`[${requestId}] 🎭 Mock mode enabled - returning mock response`);
        const agentStartTime = Date.now();
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        const agentDuration = Date.now() - agentStartTime;
        console.log(`[${requestId}] ✅ Mock agent completed in ${agentDuration}ms`);
        
        // Create mock response based on the last user message
        const lastUserMessage = langchainMessages[langchainMessages.length - 1];
        const userContent = typeof lastUserMessage.content === 'string' 
          ? lastUserMessage.content 
          : Array.isArray(lastUserMessage.content) 
            ? lastUserMessage.content.map(c => typeof c === 'string' ? c : (c as { text?: string }).text || '').join(' ')
            : '';
        const mockResponse = generateMockResponse(userContent);
        
        const assistantMessage = {
          id: messageId,
          role: 'assistant',
          content: mockResponse,
          model: 'openai/gpt-5-nano',
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150
          }
        };
        
        const timing_ms = Date.now() - startTime;
        console.log(`[${requestId}] 🎉 Mock request completed successfully in ${timing_ms}ms`);
        return res.json({
          assistant_message: assistantMessage,
          timing_ms
        });
      }
    }
    
    // Run the agent with LangSmith tracing (disabled if API key issues)
    console.log(`[${requestId}] 🤖 Invoking LangChain agent graph`);
    const agentStartTime = Date.now();
    
    // Check LangSmith configuration and warn if there are issues
    const hasValidLangSmithKey = config.langsmithApiKey && 
      config.langsmithApiKey !== 'your_langsmith_api_key_here' && 
      config.langsmithApiKey.length > 10;
    
    if (!hasValidLangSmithKey) {
      console.log(`[${requestId}] ⚠️ LangSmith tracing disabled - invalid or missing API key`);
    }
    
    const result = await graph.invoke(
      { messages: langchainMessages },
      {
        configurable: agentConfig,
        // LangSmith tracing configuration (only if API key is valid)
        ...(hasValidLangSmithKey ? {
          tags: ['web', 'agent', config.nodeEnv, 'openai/gpt-5-nano'],
          metadata: {
            conversation_id,
            message_id: messageId,
            user_id: conversation_id, // Anonymous for now
            model: 'openai/gpt-5-nano',
            latency_ms: Date.now() - startTime
          }
        } : {})
      }
    );
    
    const agentDuration = Date.now() - agentStartTime;
    console.log(`[${requestId}] ✅ Agent graph completed in ${agentDuration}ms`);
    console.log(`[${requestId}] 📊 Agent result:`, {
      messagesCount: result.messages?.length,
      lastMessageType: result.messages?.[result.messages.length - 1]?.constructor?.name,
      lastMessageLength: result.messages?.[result.messages.length - 1]?.content?.length
    });

    // Extract the last message (should be the AI response)
    console.log(`[${requestId}] 📤 Extracting assistant message from result`);
    const lastMessage = result.messages[result.messages.length - 1];
    const assistantMessage = {
      id: messageId,
      role: 'assistant',
      content: lastMessage.content,
      model: 'openai/gpt-5-nano',
      usage: {
        // Note: LangChain doesn't always provide usage info, so we'll add placeholders
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };

    const timing_ms = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Response prepared:`, {
      contentLength: assistantMessage.content.length,
      timing: timing_ms,
      messageId
    });

    console.log(`[${requestId}] 🎉 Request completed successfully in ${timing_ms}ms`);
    return res.json({
      assistant_message: assistantMessage,
      timing_ms
    });

  } catch (error) {
    const timing_ms = Date.now() - startTime;
    console.error(`[${requestId}] 💥 Chat endpoint error after ${timing_ms}ms:`, error);
    
      return res.status(500).json({
        error: 'Agent processing failed',
        message: config.nodeEnv === 'development' ? (error as Error).message : 'Something went wrong',
        timing_ms
      });
    }
  })().catch((error) => {
    const timing_ms = Date.now() - startTime;
    console.error(`[${requestId}] 💥 Unhandled error after ${timing_ms}ms:`, error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong',
      timing_ms
    });
  });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Start server
const PORT = config.serverPort;
const HOST = config.serverHost;

console.log(`🔧 Starting server with config:`, {
  PORT,
  HOST,
  NODE_ENV: config.nodeEnv,
  OPENAI_API_KEY: config.openaiApiKey ? 'SET' : 'MISSING',
  LANGCHAIN_TRACING: config.langsmithTracing,
  LANGCHAIN_PROJECT: config.langsmithProject
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Chef Chopsky Agent Service running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🔧 Environment: ${config.nodeEnv}`);
}).on('error', (error) => {
  console.error('💥 Server startup error:', error);
  process.exit(1);
});

export default app;
