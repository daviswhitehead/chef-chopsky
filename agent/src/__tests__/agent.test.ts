import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Client } from '@langchain/langgraph-sdk';
import { v4 as uuidv4 } from 'uuid';

// Test configuration
const TEST_CONFIG = {
  apiUrl: 'http://localhost:2024',
  assistantId: 'retrieval_graph',
  timeout: 30000, // 30 seconds timeout for agent responses
};

describe('Chef Chopsky LangGraph Agent', () => {
  let client: Client;

  beforeAll(async () => {
    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY not set. Tests may fail if the agent requires OpenAI API calls.');
    }
    
    // Initialize the LangGraph client
    client = new Client({ apiUrl: TEST_CONFIG.apiUrl });
    
    // Wait a moment for the server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('Basic Functionality', () => {
    it('should respond to CSA cooking questions', async () => {
      const config = {
        configurable: {
          userId: 'test-user',
          embeddingModel: 'text-embedding-3-small',
          retrieverProvider: 'memory',
          searchKwargs: { k: 3 },
          responseSystemPromptTemplate: 'You are Chef Chopsky, a helpful cooking assistant specializing in CSA-based meal planning and high-protein plant-based recipes.',
          responseModel: 'gpt-4o-mini',
          querySystemPromptTemplate: 'Generate a search query for cooking questions.',
          queryModel: 'gpt-4o-mini'
        },
        // Set the LangChain RunnableConfig name so LangSmith shows this test name
        runName: 'test-csa-cooking-questions'
      };

      let temp_id = uuidv4();
      console.log('id', temp_id);

      const runConfig = {
        // project_name: 'chef-chopsky-test',
        // run_name: 'test-csa-cooking-questions (run_name)',
        name: 'test-csa-cooking-questions (name)',
        run_id: temp_id,
        tags: ['test', 'csa', 'automated', 'basic-functionality'],
        metadata: {
          testType: 'automated',
          testName: 'should respond to CSA cooking questions',
          timestamp: new Date().toISOString()
        }
      };

      const input = {
        messages: [
          { role: 'user', content: 'I have kale, tomatoes, and quinoa from my CSA. What should I cook for dinner?' }
        ]
      };

      const streamResponse = client.runs.stream(
        null, // Threadless run
        TEST_CONFIG.assistantId,
        {
          input,
          streamMode: 'values',
          config,
          ...runConfig
        }
      );

      let finalResponse = '';
      let hasRetrievedDocs = false;
      let hasGeneratedResponse = false;

      for await (const chunk of streamResponse) {
        if (chunk.event === 'values' && chunk.data) {
          const data = chunk.data as any;
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.type === 'ai' && lastMessage.content) {
            finalResponse = lastMessage.content;
            hasGeneratedResponse = true;
          }

          if (data.retrievedDocs && data.retrievedDocs.length > 0) {
            hasRetrievedDocs = true;
          }
        }
      }

      // Assertions
      expect(finalResponse).toBeTruthy();
      expect(finalResponse.length).toBeGreaterThan(50); // Should be a substantial response
      expect(finalResponse.toLowerCase()).toContain('quinoa'); // Should mention the ingredients
      expect(finalResponse.toLowerCase()).toContain('kale');
      expect(finalResponse.toLowerCase()).toContain('tomato');
      expect(hasRetrievedDocs).toBe(true); // Should have retrieved relevant documents
      expect(hasGeneratedResponse).toBe(true); // Should have generated a response
    }, TEST_CONFIG.timeout);

    it('should handle different ingredient combinations', async () => {
      const config = {
        configurable: {
          userId: 'test-user',
          embeddingModel: 'text-embedding-3-small',
          retrieverProvider: 'memory',
          searchKwargs: { k: 3 },
          responseSystemPromptTemplate: 'You are Chef Chopsky, a helpful cooking assistant specializing in CSA-based meal planning and high-protein plant-based recipes.',
          responseModel: 'gpt-4o-mini',
          querySystemPromptTemplate: 'Generate a search query for cooking questions.',
          queryModel: 'gpt-4o-mini'
        }
      };

      const runConfig = {
        project_name: 'chef-chopsky-test',
        run_name: 'test-different-ingredient-combinations',
        name: 'test-different-ingredient-combinations',
        run_id: uuidv4(),
        tags: ['test', 'csa', 'automated', 'basic-functionality'],
        metadata: {
          testType: 'automated',
          testName: 'should handle different ingredient combinations',
          timestamp: new Date().toISOString()
        }
      };

      const input = {
        messages: [
          { role: 'user', content: 'What can I make with just kale and garlic?' }
        ]
      };

      const streamResponse = client.runs.stream(
        null,
        TEST_CONFIG.assistantId,
        {
          input,
          streamMode: 'values',
          config,
          ...runConfig
        }
      );

      let finalResponse = '';

      for await (const chunk of streamResponse) {
        if (chunk.event === 'values' && chunk.data) {
          const data = chunk.data as any;
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.type === 'ai' && lastMessage.content) {
            finalResponse = lastMessage.content;
          }
        }
      }

      expect(finalResponse).toBeTruthy();
      expect(finalResponse.toLowerCase()).toContain('kale');
      expect(finalResponse.toLowerCase()).toContain('garlic');
    }, TEST_CONFIG.timeout);
  });

  describe('Error Handling', () => {
    it('should handle empty messages gracefully', async () => {
      const config = {
        configurable: {
          userId: 'test-user',
          embeddingModel: 'text-embedding-3-small',
          retrieverProvider: 'memory',
          searchKwargs: { k: 3 },
          responseSystemPromptTemplate: 'You are Chef Chopsky, a helpful cooking assistant specializing in CSA-based meal planning and high-protein plant-based recipes.',
          responseModel: 'gpt-4o-mini',
          querySystemPromptTemplate: 'Generate a search query for cooking questions.',
          queryModel: 'gpt-4o-mini'
        }
      };

      const runConfig = {
        project_name: 'chef-chopsky-test',
        run_name: 'test-empty-message-handling',
        name: 'test-empty-message-handling',
        run_id: uuidv4(),
        tags: ['test', 'error-handling', 'automated'],
        metadata: {
          testType: 'automated',
          testName: 'should handle empty messages gracefully',
          timestamp: new Date().toISOString()
        }
      };

      const input = {
        messages: [
          { role: 'user', content: '' }
        ]
      };

      const streamResponse = client.runs.stream(
        null,
        TEST_CONFIG.assistantId,
        {
          input,
          streamMode: 'values',
          config,
          ...runConfig
        }
      );

      let hasResponse = false;

      for await (const chunk of streamResponse) {
        if (chunk.event === 'values' && chunk.data) {
          const data = chunk.data as any;
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.type === 'ai') {
            hasResponse = true;
            break;
          }
        }
      }

      // Should still provide some response, even for empty input
      expect(hasResponse).toBe(true);
    }, TEST_CONFIG.timeout);
  });

  describe('Performance', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      const config = {
        configurable: {
          userId: 'test-user',
          embeddingModel: 'text-embedding-3-small',
          retrieverProvider: 'memory',
          searchKwargs: { k: 3 },
          responseSystemPromptTemplate: 'You are Chef Chopsky, a helpful cooking assistant specializing in CSA-based meal planning and high-protein plant-based recipes.',
          responseModel: 'gpt-4o-mini',
          querySystemPromptTemplate: 'Generate a search query for cooking questions.',
          queryModel: 'gpt-4o-mini'
        }
      };

      const runConfig = {
        project_name: 'chef-chopsky-test',
        run_name: 'test-performance-response-time',
        name: 'test-performance-response-time',
        run_id: uuidv4(),
        tags: ['test', 'performance', 'automated'],
        metadata: {
          testType: 'automated',
          testName: 'should respond within reasonable time',
          timestamp: new Date().toISOString()
        }
      };

      const input = {
        messages: [
          { role: 'user', content: 'Quick recipe with spinach?' }
        ]
      };

      const streamResponse = client.runs.stream(
        null,
        TEST_CONFIG.assistantId,
        {
          input,
          streamMode: 'values',
          config,
          ...runConfig
        }
      );

      for await (const chunk of streamResponse) {
        if (chunk.event === 'values' && chunk.data) {
          const data = chunk.data as any;
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.type === 'ai' && lastMessage.content) {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            // Should respond within 15 seconds
            expect(responseTime).toBeLessThan(15000);
            break;
          }
        }
      }
    }, TEST_CONFIG.timeout);
  });
});
