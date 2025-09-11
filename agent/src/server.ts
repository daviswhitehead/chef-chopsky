import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { graph } from './retrieval_graph/graph.js';
import { ensureConfiguration } from './retrieval_graph/configuration.js';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { v4 as uuidv4 } from 'uuid';

/**
 * Chef Chopsky Agent Service
 * 
 * Express server that provides HTTP API for the LangChain agent.
 * This service runs separately from the frontend and handles AI processing.
 */

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'chef-chopsky-agent',
    version: '1.0.0'
  });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  const startTime = Date.now();
  const messageId = uuidv4();
  
  try {
    // Validate request
    const { conversation_id, messages, client_metadata } = req.body;
    
    if (!conversation_id || !messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'conversation_id and messages array are required'
      });
    }

    // Convert messages to LangChain format
    const langchainMessages = messages.map((msg: any) => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else if (msg.role === 'assistant') {
        return new AIMessage(msg.content);
      }
      throw new Error(`Unsupported message role: ${msg.role}`);
    });

    // Create configuration
    const agentConfig = ensureConfiguration({
      configurable: {
        userId: conversation_id, // Use conversation_id as userId for now
        embeddingModel: 'openai/text-embedding-3-small',
        retrieverProvider: 'memory', // Start with memory for simplicity
        searchKwargs: {},
        responseModel: 'openai/gpt-4o-mini',
        queryModel: 'openai/gpt-4o-mini'
      }
    });

    // Run the agent with LangSmith tracing
    const result = await graph.invoke(
      { messages: langchainMessages },
      {
        configurable: agentConfig,
        // LangSmith tracing configuration
        tags: ['web', 'agent', config.nodeEnv, 'openai/gpt-4o-mini'],
        metadata: {
          conversation_id,
          message_id: messageId,
          user_id: conversation_id, // Anonymous for now
          model: 'openai/gpt-4o-mini',
          latency_ms: Date.now() - startTime
        }
      }
    );

    // Extract the last message (should be the AI response)
    const lastMessage = result.messages[result.messages.length - 1];
    const assistantMessage = {
      id: messageId,
      role: 'assistant',
      content: lastMessage.content,
      model: 'openai/gpt-4o-mini',
      usage: {
        // Note: LangChain doesn't always provide usage info, so we'll add placeholders
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };

    const timing_ms = Date.now() - startTime;

    res.json({
      assistant_message: assistantMessage,
      timing_ms
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    
    const timing_ms = Date.now() - startTime;
    
    res.status(500).json({
      error: 'Agent processing failed',
      message: config.nodeEnv === 'development' ? (error as Error).message : 'Something went wrong',
      timing_ms
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

app.listen(PORT, HOST, () => {
  console.log(`🚀 Chef Chopsky Agent Service running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🔧 Environment: ${config.nodeEnv}`);
});

export default app;
