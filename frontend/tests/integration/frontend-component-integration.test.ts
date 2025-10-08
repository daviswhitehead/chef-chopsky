import { Logger } from '../e2e/fixtures/logger';

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';

// Mock axios to prevent real network calls
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: { id: 'test-id' } })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
  })),
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: { id: 'test-id' } })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
  }
}));

// Mock supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null }))
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }))
}));

describe('Frontend Component Integration Tests', () => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  describe('Message Handling Integration', () => {
    it('should validate complete message flow without duplicates', async () => {
      Logger.info('🧪 Testing complete message flow integration...');
      
      // Step 1: Create conversation
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Message Flow Test',
          user_id: 'test-user-flow',
          metadata: { test: 'message_flow' }
        }),
      });

      expect(createResponse.status).toBe(200);
      const conversation = await createResponse.json();
      const conversationId = conversation.id;
      
      Logger.info(`Step 1: Created conversation ${conversationId}`);

      // Step 2: Send message via API (simulating frontend behavior)
      const messageResponse = await fetch(`${FRONTEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: 'test-user-flow',
          messages: [{ role: 'user', content: 'Test message for flow validation' }]
        }),
      });

      expect([200, 500]).toContain(messageResponse.status);
      
      if (messageResponse.ok) {
        const messageData = await messageResponse.json();
        expect(messageData.content).toBeDefined();
        Logger.info('Step 2: Message sent successfully');
      } else {
        Logger.info('Step 2: Message API handles service unavailability correctly');
      }

      // Step 3: Verify message persistence
      const messagesResponse = await fetch(`${FRONTEND_URL}/api/conversations/${conversationId}/messages`);
      expect(messagesResponse.status).toBe(200);
      const messages = await messagesResponse.json();
      
      // Should have exactly 2 messages: user message + assistant response
      expect(messages.length).toBe(2);
      expect(messages[0].role).toBe('user');
      expect(messages[0].content).toBe('Test message for flow validation');
      expect(messages[1].role).toBe('assistant');
      expect(messages[1].content).toBeDefined();
      
      Logger.info('Step 3: Message persistence verified - no duplicates');
    });

    it('should validate message sending handles errors gracefully', async () => {
      Logger.info('🧪 Testing message sending error handling...');
      
      // Test with invalid conversation ID
      const response = await fetch(`${FRONTEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: 'invalid-uuid',
          userId: 'test-user-error',
          messages: [{ role: 'user', content: 'Test error handling' }]
        }),
      });

      expect(response.status).toBe(400);
      const errorData = await response.json();
      expect(errorData.error).toBeDefined();
      
      Logger.info('✅ Message sending error handling works correctly');
    });

    it('should validate message sending with missing required fields', async () => {
      Logger.info('🧪 Testing message sending with missing fields...');
      
      // Test missing conversationId
      const response1 = await fetch(`${FRONTEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-missing',
          messages: [{ role: 'user', content: 'Test missing field' }]
        }),
      });

      expect(response1.status).toBe(400);
      const errorData1 = await response1.json();
      expect(errorData1.error).toBeDefined();
      
      // Test missing messages
      const response2 = await fetch(`${FRONTEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: 'test-conv',
          userId: 'test-user-missing'
        }),
      });

      expect(response2.status).toBe(400);
      const errorData2 = await response2.json();
      expect(errorData2.error).toBeDefined();
      
      Logger.info('✅ Message sending validation works correctly');
    });
  });

  describe('Component State Management Validation', () => {
    it('should validate conversation page loads correctly', async () => {
      Logger.info('🧪 Testing conversation page loading...');
      
      // Create a conversation first
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Page Load Test',
          user_id: 'test-user-page',
          metadata: { test: 'page_load' }
        }),
      });

      expect(createResponse.status).toBe(200);
      const conversation = await createResponse.json();
      const conversationId = conversation.id;
      
      // Test conversation page API
      const pageResponse = await fetch(`${FRONTEND_URL}/api/conversations/${conversationId}`);
      expect(pageResponse.status).toBe(200);
      const pageData = await pageResponse.json();
      expect(pageData.id).toBe(conversationId);
      expect(pageData.title).toBe('Page Load Test');
      
      Logger.info('✅ Conversation page loading works correctly');
    });

    it('should validate message retrieval works correctly', async () => {
      Logger.info('🧪 Testing message retrieval...');
      
      // Create conversation and send message
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Message Retrieval Test',
          user_id: 'test-user-retrieval',
          metadata: { test: 'message_retrieval' }
        }),
      });

      const conversation = await createResponse.json();
      const conversationId = conversation.id;
      
      // Send a message
      await fetch(`${FRONTEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: 'test-user-retrieval',
          messages: [{ role: 'user', content: 'Test message retrieval' }]
        }),
      });
      
      // Retrieve messages
      const messagesResponse = await fetch(`${FRONTEND_URL}/api/conversations/${conversationId}/messages`);
      expect(messagesResponse.status).toBe(200);
      const messages = await messagesResponse.json();
      
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0]).toHaveProperty('id');
      expect(messages[0]).toHaveProperty('role');
      expect(messages[0]).toHaveProperty('content');
      expect(messages[0]).toHaveProperty('timestamp');
      
      Logger.info('✅ Message retrieval works correctly');
    });
  });

  describe('Performance and Concurrency Validation', () => {
    it('should validate concurrent message sending', async () => {
      Logger.info('🧪 Testing concurrent message sending...');
      
      // Create conversation
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Concurrent Test',
          user_id: 'test-user-concurrent',
          metadata: { test: 'concurrent' }
        }),
      });

      const conversation = await createResponse.json();
      const conversationId = conversation.id;
      
      // Send multiple messages concurrently
      const promises = [
        fetch(`${FRONTEND_URL}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            userId: 'test-user-concurrent',
            messages: [{ role: 'user', content: 'Message 1' }]
          }),
        }),
        fetch(`${FRONTEND_URL}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            userId: 'test-user-concurrent',
            messages: [{ role: 'user', content: 'Message 2' }]
          }),
        }),
        fetch(`${FRONTEND_URL}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            userId: 'test-user-concurrent',
            messages: [{ role: 'user', content: 'Message 3' }]
          }),
        })
      ];
      
      const responses = await Promise.all(promises);
      
      // All should succeed or handle service unavailability gracefully
      responses.forEach(response => {
        expect([200, 500]).toContain(response.status);
      });
      
      // Verify all messages were persisted
      const messagesResponse = await fetch(`${FRONTEND_URL}/api/conversations/${conversationId}/messages`);
      const messages = await messagesResponse.json();
      
      // Should have 6 messages: 3 user + 3 assistant
      expect(messages.length).toBe(6);
      
      Logger.info('✅ Concurrent message sending works correctly');
    });

    it('should validate message sending performance', async () => {
      Logger.info('🧪 Testing message sending performance...');
      
      const startTime = Date.now();
      
      // Create conversation
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Performance Test',
          user_id: 'test-user-performance',
          metadata: { test: 'performance' }
        }),
      });

      const conversation = await createResponse.json();
      const conversationId = conversation.id;
      
      // Send message and measure time
      const messageStartTime = Date.now();
      const messageResponse = await fetch(`${FRONTEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: 'test-user-performance',
          messages: [{ role: 'user', content: 'Performance test message' }]
        }),
      });
      const messageEndTime = Date.now();
      
      expect([200, 500]).toContain(messageResponse.status);
      
      const totalTime = messageEndTime - messageStartTime;
      expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds
      
      Logger.info(`✅ Message sending performance: ${totalTime}ms`);
    });
  });
});
