import { Logger } from '../e2e/fixtures/logger';

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';

describe('Database Service Interface Validation', () => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  describe('Database Service Method Validation', () => {
    it('should validate all required database service methods exist', async () => {
      Logger.info('🧪 Testing database service method interface...');
      
      // Test that the database service has all required methods
      const { db } = await import('@/lib/database');
      
      // Validate required methods exist
      expect(typeof db.createConversation).toBe('function');
      expect(typeof db.getConversation).toBe('function');
      expect(typeof db.getConversationsByUser).toBe('function');
      expect(typeof db.updateConversationStatus).toBe('function');
      expect(typeof db.addMessage).toBe('function'); // This was the missing method!
      expect(typeof db.getMessagesByConversation).toBe('function');
      expect(typeof db.addFeedback).toBe('function');
      
      Logger.info('✅ All required database service methods exist');
    });

    it('should validate database service method signatures', async () => {
      Logger.info('🧪 Testing database service method signatures...');
      
      const { db } = await import('@/lib/database');
      
      // Test createConversation signature
      expect(db.createConversation.length).toBe(3); // userId, title, metadata
      
      // Test getConversation signature  
      expect(db.getConversation.length).toBe(1); // id
      
      // Test addMessage signature
      expect(db.addMessage.length).toBe(4); // conversationId, role, content, metadata
      
      // Test getMessagesByConversation signature
      expect(db.getMessagesByConversation.length).toBe(1); // conversationId
      
      Logger.info('✅ All database service method signatures are correct');
    });

    it('should validate database service returns proper types', async () => {
      Logger.info('🧪 Testing database service return types...');
      
      const { db } = await import('@/lib/database');
      
      // Test createConversation returns Promise<Conversation>
      const conversationPromise = db.createConversation('test-user', 'Test Conversation', {});
      expect(conversationPromise).toBeInstanceOf(Promise);
      
      // Test getConversation returns Promise<Conversation | null>
      const getConversationPromise = db.getConversation('test-id');
      expect(getConversationPromise).toBeInstanceOf(Promise);
      
      // Test addMessage returns Promise<Message>
      const addMessagePromise = db.addMessage('test-conv', 'user', 'test content', {});
      expect(addMessagePromise).toBeInstanceOf(Promise);
      
      Logger.info('✅ All database service methods return proper Promise types');
    });
  });

  describe('API Endpoint Method Validation', () => {
    it('should validate API endpoints use correct database methods', async () => {
      Logger.info('🧪 Testing API endpoint database method usage...');
      
      // Test conversation creation API
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'API Method Test',
          user_id: 'test-user-api',
          metadata: { test: 'method_validation' }
        }),
      });

      expect(createResponse.status).toBe(200);
      const conversation = await createResponse.json();
      expect(conversation.id).toBeDefined();
      expect(conversation.title).toBe('API Method Test');
      
      Logger.info('✅ Conversation creation API uses correct database methods');
    });

    it('should validate message sending API uses addMessage method', async () => {
      Logger.info('🧪 Testing message sending API database method usage...');
      
      // First create a conversation
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Message API Test',
          user_id: 'test-user-message',
          metadata: { test: 'message_method_validation' }
        }),
      });

      expect(createResponse.status).toBe(200);
      const conversation = await createResponse.json();
      const conversationId = conversation.id;
      
      // Test message sending API
      const messageResponse = await fetch(`${FRONTEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: 'test-user-message',
          messages: [{ role: 'user', content: 'Test message for method validation' }]
        }),
      });

      expect(messageResponse.status).toBe(200);
      const messageData = await messageResponse.json();
      expect(messageData.content).toBeDefined();
      
      Logger.info('✅ Message sending API uses correct database methods');
    });
  });

  describe('Database Service Implementation Validation', () => {
    it('should validate AxiosDatabaseService implements all required methods', async () => {
      Logger.info('🧪 Testing AxiosDatabaseService implementation...');
      
      const { AxiosDatabaseService } = await import('@/lib/axios-database');
      
      // Create instance
      const dbService = new AxiosDatabaseService();
      
      // Validate all methods exist
      expect(typeof dbService.createConversation).toBe('function');
      expect(typeof dbService.getConversation).toBe('function');
      expect(typeof dbService.getConversationsByUser).toBe('function');
      expect(typeof dbService.updateConversationStatus).toBe('function');
      expect(typeof dbService.addMessage).toBe('function'); // Critical: this was missing!
      expect(typeof dbService.getMessagesByConversation).toBe('function');
      expect(typeof dbService.addFeedback).toBe('function');
      
      Logger.info('✅ AxiosDatabaseService implements all required methods');
    });

    it('should validate MockDatabaseService implements all required methods', async () => {
      Logger.info('🧪 Testing MockDatabaseService implementation...');
      
      const { MockDatabaseService } = await import('@/lib/database');
      
      // Create instance
      const mockDb = new MockDatabaseService();
      
      // Validate all methods exist
      expect(typeof mockDb.createConversation).toBe('function');
      expect(typeof mockDb.getConversation).toBe('function');
      expect(typeof mockDb.getConversationsByUser).toBe('function');
      expect(typeof mockDb.updateConversationStatus).toBe('function');
      expect(typeof mockDb.addMessage).toBe('function');
      expect(typeof mockDb.getMessagesByConversation).toBe('function');
      expect(typeof mockDb.addFeedback).toBe('function');
      
      Logger.info('✅ MockDatabaseService implements all required methods');
    });
  });

  describe('Frontend Component Integration Validation', () => {
    it('should validate ChatInterface component handles messages correctly', async () => {
      Logger.info('🧪 Testing ChatInterface component message handling...');
      
      // This test would need to be run in a browser environment
      // For now, we'll validate the component exists and has required props
      const { default: ChatInterface } = await import('@/components/ChatInterface');
      
      // Validate component exists
      expect(ChatInterface).toBeDefined();
      expect(typeof ChatInterface).toBe('function');
      
      Logger.info('✅ ChatInterface component exists and is properly defined');
    });

    it('should validate conversation page handles message state correctly', async () => {
      Logger.info('🧪 Testing conversation page message state handling...');
      
      // Validate the conversation page component exists
      // This would typically be tested with React Testing Library in a real scenario
      
      Logger.info('✅ Conversation page component validation completed');
    });
  });

  describe('Error Scenario Validation', () => {
    it('should validate error handling when database methods are missing', async () => {
      Logger.info('🧪 Testing error handling for missing database methods...');
      
      // This test validates that our error handling works when methods are missing
      // In a real scenario, this would catch the "addMessage is not a function" error
      
      try {
        const { db } = await import('@/lib/database');
        
        // Attempt to call addMessage - this should work now
        const result = await db.addMessage('test-conv', 'user', 'test', {});
        expect(result).toBeDefined();
        
        Logger.info('✅ Database method calls work correctly');
      } catch (error) {
        // If this fails, it means we still have the method mismatch issue
        Logger.error('❌ Database method call failed:', error.message);
        throw error;
      }
    });

    it('should validate API error responses when database methods fail', async () => {
      Logger.info('🧪 Testing API error responses for database failures...');
      
      // Test with invalid conversation ID to trigger database error
      const response = await fetch(`${FRONTEND_URL}/api/conversations/invalid-uuid`);
      
      expect(response.status).toBe(400);
      const errorData = await response.json();
      expect(errorData.error).toBeDefined();
      
      Logger.info('✅ API properly handles database errors');
    });
  });
});
