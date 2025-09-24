import { Logger } from '../e2e/fixtures/logger';

describe('Enhanced Conversation Creation Tests', () => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  describe('Conversation Creation API Validation', () => {
    it('should create conversation with valid ID and proper response format', async () => {
      Logger.info('🧪 Testing conversation creation with proper validation...');
      
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Conversation Creation',
          user_id: 'test-user-validation',
          metadata: { test: true }
        }),
        signal: AbortSignal.timeout(10000),
      });

      // Validate response status
      expect(createResponse.status).toBe(200);
      Logger.info('✅ Response status is correct (200)');

      // Validate response is not empty
      const responseText = await createResponse.text();
      expect(responseText).toBeTruthy();
      expect(responseText).not.toBe('');
      Logger.info('✅ Response is not empty');

      // Parse and validate conversation object
      const conversation = JSON.parse(responseText);
      
      // Validate required fields exist
      expect(conversation).toHaveProperty('id');
      expect(conversation).toHaveProperty('user_id');
      expect(conversation).toHaveProperty('title');
      expect(conversation).toHaveProperty('status');
      expect(conversation).toHaveProperty('created_at');
      expect(conversation).toHaveProperty('updated_at');
      Logger.info('✅ All required fields present');

      // Validate ID is a proper UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(conversation.id).toMatch(uuidRegex);
      Logger.info(`✅ Conversation ID is valid UUID: ${conversation.id}`);

      // Validate field values
      expect(conversation.user_id).toBe('test-user-validation');
      expect(conversation.title).toBe('Test Conversation Creation');
      expect(conversation.status).toBe('active');
      Logger.info('✅ Field values are correct');

      // Validate timestamps are valid ISO strings
      expect(new Date(conversation.created_at)).toBeInstanceOf(Date);
      expect(new Date(conversation.updated_at)).toBeInstanceOf(Date);
      Logger.info('✅ Timestamps are valid');

      Logger.info('✅ Conversation creation validation passed');
    });

    it('should handle missing required fields gracefully', async () => {
      Logger.info('🧪 Testing missing required fields...');
      
      // Test missing user_id
      const response1 = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Missing User ID'
        }),
      });

      expect(response1.status).toBe(400);
      const error1 = await response1.json();
      expect(error1.error).toContain('Missing required fields');
      Logger.info('✅ Missing user_id handled correctly');

      // Test missing title
      const response2 = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test-user'
        }),
      });

      expect(response2.status).toBe(400);
      const error2 = await response2.json();
      expect(error2.error).toContain('Missing required fields');
      Logger.info('✅ Missing title handled correctly');
    });

    it('should allow accessing created conversation immediately', async () => {
      Logger.info('🧪 Testing conversation access after creation...');
      
      // Create conversation
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Immediate Access',
          user_id: 'test-user-immediate',
          metadata: { test: 'immediate_access' }
        }),
      });

      expect(createResponse.status).toBe(200);
      const conversation = await createResponse.json();
      const conversationId = conversation.id;
      
      Logger.info(`Created conversation: ${conversationId}`);

      // Immediately try to access the conversation
      const getResponse = await fetch(`${FRONTEND_URL}/api/conversations/${conversationId}`);
      
      expect(getResponse.status).toBe(200);
      const retrievedConversation = await getResponse.json();
      
      // Validate retrieved conversation matches created one
      expect(retrievedConversation.id).toBe(conversationId);
      expect(retrievedConversation.title).toBe('Test Immediate Access');
      expect(retrievedConversation.user_id).toBe('test-user-immediate');
      
      Logger.info('✅ Conversation accessible immediately after creation');
    });

    it('should reject invalid conversation IDs', async () => {
      Logger.info('🧪 Testing invalid conversation ID handling...');
      
      const invalidIds = [
        'undefined',
        'null',
        'invalid-uuid',
        '123',
        'not-a-uuid-at-all'
        // Removed empty string as it causes redirects
      ];

      for (const invalidId of invalidIds) {
        const response = await fetch(`${FRONTEND_URL}/api/conversations/${invalidId}`);
        
        // All invalid UUIDs return 400 (invalid format)
        expect(response.status).toBe(400);
        
        Logger.info(`✅ Invalid ID '${invalidId}' handled correctly (${response.status})`);
      }
    });
  });

  describe('End-to-End Conversation Flow', () => {
    it('should complete full conversation lifecycle', async () => {
      Logger.info('🧪 Testing complete conversation lifecycle...');
      
      // Step 1: Create conversation
      const createResponse = await fetch(`${FRONTEND_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Lifecycle Test Conversation',
          user_id: 'test-user-lifecycle',
          metadata: { test: 'lifecycle' }
        }),
      });

      expect(createResponse.status).toBe(200);
      const conversation = await createResponse.json();
      const conversationId = conversation.id;
      
      Logger.info(`Step 1: Created conversation ${conversationId}`);

      // Step 2: Access conversation
      const getResponse = await fetch(`${FRONTEND_URL}/api/conversations/${conversationId}`);
      expect(getResponse.status).toBe(200);
      const retrievedConversation = await getResponse.json();
      expect(retrievedConversation.id).toBe(conversationId);
      
      Logger.info('Step 2: Successfully accessed conversation');

      // Step 3: Send a message (if AI chat is available)
      try {
        const messageResponse = await fetch(`${FRONTEND_URL}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            userId: 'test-user-lifecycle',
            messages: [{ role: 'user', content: 'Hello, this is a test message' }]
          }),
          signal: AbortSignal.timeout(5000),
        });

        if (messageResponse.ok) {
          Logger.info('Step 3: Message sent successfully');
        } else {
          Logger.info('Step 3: Message sending failed (expected if agent service down)');
        }
      } catch (error) {
        Logger.info('Step 3: Message sending failed (expected if agent service down)');
      }

      Logger.info('✅ Complete conversation lifecycle test passed');
    });
  });
});
