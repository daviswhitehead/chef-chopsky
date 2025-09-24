import { Logger } from '../e2e/fixtures/logger';

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';

describe('Critical Integration Issues Prevention', () => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  describe('Database Service Method Mismatch Prevention', () => {
    it('should catch addMessage method mismatch before deployment', async () => {
      Logger.info('🧪 Testing for addMessage method mismatch (critical issue prevention)...');
      
      // This test would have caught the "addMessage is not a function" error
      const { db } = await import('@/lib/database');
      
      // Validate the method exists and is callable
      expect(typeof db.addMessage).toBe('function');
      
      // Test that the method can be called with correct parameters (without network call)
      try {
        // Just validate the method signature, don't actually call it
        expect(db.addMessage.length).toBe(4); // conversationId, role, content, metadata
        Logger.info('✅ addMessage method exists and has correct signature');
      } catch (error) {
        Logger.error('❌ addMessage method validation failed:', error.message);
        throw new Error(`Database service method mismatch detected: ${error.message}`);
      }
    });

    it('should validate all database service implementations have consistent interfaces', async () => {
      Logger.info('🧪 Testing database service interface consistency...');
      
      // Test MockDatabaseService
      const { MockDatabaseService } = await import('@/lib/database');
      const mockDb = new MockDatabaseService();
      
      // Test AxiosDatabaseService
      const { AxiosDatabaseService } = await import('@/lib/axios-database');
      const axiosDb = new AxiosDatabaseService();
      
      // Define required methods
      const requiredMethods = [
        'createConversation',
        'getConversation', 
        'getConversationsByUser',
        'updateConversationStatus',
        'addMessage', // This was the missing method!
        'getMessagesByConversation',
        'addFeedback'
      ];
      
      // Validate both implementations have all required methods
      requiredMethods.forEach(method => {
        expect(typeof mockDb[method]).toBe('function');
        expect(typeof axiosDb[method]).toBe('function');
        Logger.info(`✅ Both implementations have ${method} method`);
      });
      
      Logger.info('✅ All database service implementations have consistent interfaces');
    });
  });

  describe('API Endpoint Integration Validation', () => {
    it('should validate API endpoints can complete full message flow', async () => {
      Logger.info('🧪 Testing complete API message flow (would catch addMessage issue)...');
      
      // Step 1: Create conversation
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'API Flow Validation',
          user_id: 'test-user-api-flow',
          metadata: { test: 'api_flow_validation' }
        }),
      });

      expect(createResponse.status).toBe(200);
      const conversation = await createResponse.json();
      const conversationId = conversation.id;
      
      Logger.info(`Step 1: Created conversation ${conversationId}`);

      // Step 2: Send message (this would have failed with addMessage issue)
      const messageResponse = await fetch(`${FRONTEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: 'test-user-api-flow',
          messages: [{ role: 'user', content: 'Test API flow validation' }]
        }),
      });

      // This assertion would have failed with the addMessage issue
      expect(messageResponse.status).toBe(200);
      const messageData = await messageResponse.json();
      expect(messageData.content).toBeDefined();
      
      Logger.info('Step 2: Message sent successfully via API');

      // Step 3: Verify message persistence
      const messagesResponse = await fetch(`${FRONTEND_URL}/api/conversations/${conversationId}/messages`);
      expect(messagesResponse.status).toBe(200);
      const messages = await messagesResponse.json();
      
      // Should have exactly 2 messages: user + assistant
      expect(messages.length).toBe(2);
      expect(messages[0].role).toBe('user');
      expect(messages[1].role).toBe('assistant');
      
      Logger.info('Step 3: Message persistence verified');
    });

    it('should validate error handling for database method failures', async () => {
      Logger.info('🧪 Testing error handling for database method failures...');
      
      // This test ensures we have proper error handling when database methods fail
      // In the original issue, this would have caught the "addMessage is not a function" error
      
      try {
        const { db } = await import('@/lib/database');
        
        // Attempt to call addMessage - if this fails, we catch it here
        await db.addMessage('test-conv', 'user', 'test error handling', {});
        
        Logger.info('✅ Database method calls work correctly');
      } catch (error) {
        // If we get here, it means there's a method mismatch
        Logger.error('❌ Database method call failed:', error.message);
        
        // This would have caught the original issue
        if (error.message.includes('is not a function')) {
          throw new Error(`Database service method mismatch detected: ${error.message}`);
        }
        
        // Re-throw other errors
        throw error;
      }
    });
  });

  describe('Frontend Component State Management Validation', () => {
    it('should validate message state management prevents duplicates', async () => {
      Logger.info('🧪 Testing message state management (duplicate prevention)...');
      
      // Create conversation
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'State Management Test',
          user_id: 'test-user-state',
          metadata: { test: 'state_management' }
        }),
      });

      const conversation = await createResponse.json();
      const conversationId = conversation.id;
      
      // Send multiple messages to test state management
      const messagePromises = [
        fetch(`${FRONTEND_URL}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            userId: 'test-user-state',
            messages: [{ role: 'user', content: 'Message 1' }]
          }),
        }),
        fetch(`${FRONTEND_URL}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            userId: 'test-user-state',
            messages: [{ role: 'user', content: 'Message 2' }]
          }),
        })
      ];
      
      const responses = await Promise.all(messagePromises);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Verify no duplicate messages
      const messagesResponse = await fetch(`${FRONTEND_URL}/api/conversations/${conversationId}/messages`);
      const messages = await messagesResponse.json();
      
      // Should have exactly 4 messages: 2 user + 2 assistant
      expect(messages.length).toBe(4);
      
      // Verify message content uniqueness
      const userMessages = messages.filter(m => m.role === 'user');
      const assistantMessages = messages.filter(m => m.role === 'assistant');
      
      expect(userMessages.length).toBe(2);
      expect(assistantMessages.length).toBe(2);
      
      // Verify no duplicate content
      const userContents = userMessages.map(m => m.content);
      const assistantContents = assistantMessages.map(m => m.content);
      
      expect(new Set(userContents).size).toBe(userContents.length); // No duplicates
      expect(new Set(assistantContents).size).toBe(assistantContents.length); // No duplicates
      
      Logger.info('✅ Message state management prevents duplicates');
    });
  });

  describe('Deployment Readiness Validation', () => {
    it('should validate all critical paths work before deployment', async () => {
      Logger.info('🧪 Testing deployment readiness (critical path validation)...');
      
      // Test 1: Service health
      const healthResponse = await fetch(`${FRONTEND_URL}/`);
      expect(healthResponse.status).toBe(200);
      
      // Test 2: Database connectivity
      const { db } = await import('@/lib/database');
      expect(typeof db.createConversation).toBe('function');
      expect(typeof db.addMessage).toBe('function'); // Critical check
      
      // Test 3: API endpoints
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Deployment Test',
          user_id: 'test-user-deployment',
          metadata: { test: 'deployment' }
        }),
      });
      expect(createResponse.status).toBe(200);
      
      // Test 4: Message flow
      const conversation = await createResponse.json();
      const messageResponse = await fetch(`${FRONTEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          userId: 'test-user-deployment',
          messages: [{ role: 'user', content: 'Deployment test message' }]
        }),
      });
      expect(messageResponse.status).toBe(200);
      
      Logger.info('✅ All critical paths validated for deployment');
    });
  });
});
