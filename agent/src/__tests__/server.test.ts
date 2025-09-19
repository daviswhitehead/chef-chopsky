import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  timeout: 10000, // 10 seconds timeout for server responses
};

describe('Chef Chopsky Agent Service', () => {
  let hasValidApiKey = false;

  beforeAll(async () => {
    // Wait a moment for the server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we have a valid API key by testing the chat endpoint
    try {
      const testResponse = await fetch(`${TEST_CONFIG.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: 'test-api-key-check',
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      
      const testData = await testResponse.json();
      // If we get a 401 or API key error, skip chat tests
      hasValidApiKey = !testData.message?.includes('API key') && !testData.message?.includes('401');
      
      if (!hasValidApiKey) {
        console.log('⚠️ No valid OpenAI API key found - skipping chat endpoint tests');
      }
    } catch (error) {
      console.log('⚠️ Could not test API key - skipping chat endpoint tests');
      hasValidApiKey = false;
    }
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/health`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('service', 'chef-chopsky-agent');
      expect(data).toHaveProperty('version', '1.0.0');
    });
  });

  describe('Chat Endpoint', () => {
    it('should process valid chat request and return assistant response', async () => {
      if (!hasValidApiKey) {
        console.log('⏭️ Skipping test - no valid API key');
        return;
      }
      const conversationId = uuidv4();
      const requestBody = {
        conversation_id: conversationId,
        messages: [
          {
            role: 'user',
            content: 'Give me a simple high-protein plant-based dinner idea.'
          }
        ],
        client_metadata: {
          user_agent: 'test-client',
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch(`${TEST_CONFIG.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('assistant_message');
      expect(data).toHaveProperty('timing_ms');
      
      const { assistant_message } = data;
      expect(assistant_message).toHaveProperty('id');
      expect(assistant_message).toHaveProperty('role', 'assistant');
      expect(assistant_message).toHaveProperty('content');
      expect(assistant_message).toHaveProperty('model');
      expect(assistant_message).toHaveProperty('usage');
      
      // Verify content is not empty and seems like a cooking response
      expect(assistant_message.content).toBeTruthy();
      expect(assistant_message.content.length).toBeGreaterThan(10);
      
      // Verify timing is reasonable (should be > 0 and < 30 seconds)
      expect(data.timing_ms).toBeGreaterThan(0);
      expect(data.timing_ms).toBeLessThan(30000);
    });

    it('should handle different message types', async () => {
      if (!hasValidApiKey) {
        console.log('⏭️ Skipping test - no valid API key');
        return;
      }
      const conversationId = uuidv4();
      const requestBody = {
        conversation_id: conversationId,
        messages: [
          {
            role: 'user',
            content: 'What are some good sources of plant protein?'
          }
        ]
      };

      const response = await fetch(`${TEST_CONFIG.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.assistant_message.content).toBeTruthy();
      expect(data.assistant_message.content).toContain('protein');
    });

    it('should handle conversation context', async () => {
      if (!hasValidApiKey) {
        console.log('⏭️ Skipping test - no valid API key');
        return;
      }
      const conversationId = uuidv4();
      
      // First message
      const firstRequest = {
        conversation_id: conversationId,
        messages: [
          {
            role: 'user',
            content: 'I want to make a stir-fry tonight.'
          }
        ]
      };

      const firstResponse = await fetch(`${TEST_CONFIG.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firstRequest),
      });

      expect(firstResponse.status).toBe(200);
      const firstData = await firstResponse.json();
      expect(firstData.assistant_message.content).toBeTruthy();

      // Follow-up message
      const followUpRequest = {
        conversation_id: conversationId,
        messages: [
          {
            role: 'user',
            content: 'I want to make a stir-fry tonight.'
          },
          {
            role: 'assistant',
            content: firstData.assistant_message.content
          },
          {
            role: 'user',
            content: 'What vegetables should I use?'
          }
        ]
      };

      const followUpResponse = await fetch(`${TEST_CONFIG.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpRequest),
      });

      expect(followUpResponse.status).toBe(200);
      const followUpData = await followUpResponse.json();
      expect(followUpData.assistant_message.content).toBeTruthy();
      // The response should mention vegetables or veggies (AI might use either term)
      expect(followUpData.assistant_message.content).toMatch(/vegetable|veggie|produce|ingredient/);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid request body', async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invalid: 'data' }),
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing conversation_id', async () => {
      const requestBody = {
        messages: [
          {
            role: 'user',
            content: 'Test message'
          }
        ]
      };

      const response = await fetch(`${TEST_CONFIG.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing messages', async () => {
      const requestBody = {
        conversation_id: uuidv4()
      };

      const response = await fetch(`${TEST_CONFIG.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for empty messages array', async () => {
      const requestBody = {
        conversation_id: uuidv4(),
        messages: []
      };

      const response = await fetch(`${TEST_CONFIG.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('CORS', () => {
    it('should include CORS headers on preflight request', async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/chat`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
    });

    it('should include CORS headers on actual request', async () => {
      if (!hasValidApiKey) {
        console.log('⏭️ Skipping test - no valid API key');
        return;
      }
      const conversationId = uuidv4();
      const requestBody = {
        conversation_id: conversationId,
        messages: [
          {
            role: 'user',
            content: 'Test CORS'
          }
        ]
      };

      const response = await fetch(`${TEST_CONFIG.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });
});
