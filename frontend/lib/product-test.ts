import { Client } from 'langsmith';
import { DatabaseService } from './database';

// Test configuration
const LANGSMITH_PROJECT = process.env.LANGSMITH_PROJECT || 'chef chopsky';
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class ProductTest {
  private langsmithClient: Client;
  private db: DatabaseService;

  constructor() {
    this.langsmithClient = new Client({
      apiUrl: process.env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com',
      apiKey: process.env.LANGSMITH_API_KEY,
    });
    this.db = new DatabaseService();
  }

  /**
   * Run a complete product test: create conversation -> send message -> validate LangSmith
   */
  async runProductTest(): Promise<{
    success: boolean;
    conversationId?: string;
    messageId?: string;
    langsmithRunId?: string;
    error?: string;
    details?: any;
  }> {
    console.log('🧪 Starting Product Test...');
    console.log('📝 This test will:');
    console.log('   1. Create a new conversation');
    console.log('   2. Send a test message');
    console.log('   3. Validate LangSmith tracing');
    console.log('');

    try {
      // Step 1: Create a new conversation
      console.log('1️⃣ Creating new conversation...');
      const conversation = await this.createConversation();
      console.log(`   ✅ Conversation created: ${conversation.id}`);
      console.log(`   📋 Title: ${conversation.title}`);
      console.log('');

      // Step 2: Send a test message
      console.log('2️⃣ Sending test message...');
      const message = await this.sendMessage(conversation.id, 'Hello Chef Chopsky! Can you help me plan a simple dinner for tonight?');
      console.log(`   ✅ Message sent successfully`);
      console.log(`   🤖 AI Response: ${message.content.substring(0, 100)}...`);
      console.log('');

      // Step 3: Validate LangSmith tracing
      console.log('3️⃣ Validating LangSmith tracing...');
      console.log(`   🔍 Looking for run ID: ${message.runId}`);
      console.log(`   🔍 Looking for conversation ID: ${conversation.id}`);
      
      // Wait a moment for LangSmith to process the run
      console.log('   ⏳ Waiting 2 seconds for LangSmith to process...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const langsmithValidation = await this.validateLangSmithTracing(conversation.id, message.runId);
      
      if (langsmithValidation.success) {
        console.log(`   ✅ LangSmith run found: ${langsmithValidation.runId}`);
        console.log(`   📊 Status: ${langsmithValidation.status}`);
        console.log(`   ⏱️  Response time: ${langsmithValidation.responseTime}ms`);
        console.log(`   💰 Cost: $${langsmithValidation.cost}`);
        console.log('');
        console.log('🎉 Product test PASSED! LangSmith integration is working correctly.');
        
        return {
          success: true,
          conversationId: conversation.id,
          messageId: message.id,
          langsmithRunId: langsmithValidation.runId,
          details: {
            conversation: conversation,
            message: message,
            langsmith: langsmithValidation
          }
        };
      } else {
        console.log(`   ❌ LangSmith validation failed: ${langsmithValidation.error}`);
        console.log('');
        console.log('💥 Product test FAILED! LangSmith integration has issues.');
        
        return {
          success: false,
          conversationId: conversation.id,
          messageId: message.id,
          error: langsmithValidation.error,
          details: {
            conversation: conversation,
            message: message,
            langsmith: langsmithValidation
          }
        };
      }

    } catch (error: any) {
      console.log(`💥 Product test FAILED with error: ${error.message}`);
      console.log('');
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a new conversation using the database service
   */
  private async createConversation(): Promise<{ id: string; title: string }> {
    const title = `Product Test ${new Date().toISOString()}`;
    const metadata = {
      csaBox: [],
      dietaryPreferences: [],
      mealCount: 10,
      prepTime: 120,
    };

    const conversation = await this.db.createConversation('test-user-product-test', title, metadata);
    console.log(`   📝 Created conversation with ID: ${conversation.id}`);
    return {
      id: conversation.id,
      title: conversation.title
    };
  }

  /**
   * Send a message using the product chat API
   */
  private async sendMessage(conversationId: string, content: string): Promise<{ id: string; content: string }> {
    console.log(`   💬 Sending message to conversation: ${conversationId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: content }
        ],
        userId: 'test-user-product-test',
        conversationId: conversationId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`   🤖 Got AI response (${result.content.length} chars)`);
    console.log(`   🔗 Run ID returned: ${result.runId}`);
    
    return {
      id: `msg-${Date.now()}`, // We don't get a message ID back, so we'll create one
      content: result.content,
      runId: result.runId
    };
  }

  /**
   * Validate that the conversation was properly traced in LangSmith
   */
  private async validateLangSmithTracing(conversationId: string, expectedRunId?: string): Promise<{
    success: boolean;
    runId?: string;
    status?: string;
    responseTime?: number;
    cost?: number;
    error?: string;
  }> {
    try {
      // Get recent runs from LangSmith
      const runs = await this.langsmithClient.listRuns({
        projectName: LANGSMITH_PROJECT,
        limit: 10
      });

      // Convert async iterable to array
      const runList = [];
      for await (const run of runs) {
        runList.push(run);
      }
      
      console.log(`   📊 Found ${runList.length} recent runs in LangSmith`);
      if (runList.length > 0) {
        console.log(`   🔍 Most recent run ID: ${runList[0].id}`);
        console.log(`   🔍 Most recent run status: ${runList[0].status}`);
      }

      // Look for a run that matches our conversation ID or expected run ID
      const matchingRun = runList.find(run => {
        // First, check if we have an expected run ID
        if (expectedRunId && run.id === expectedRunId) {
          return true;
        }
        
        // Check if the conversation ID appears in inputs or session_id
        const inputs = run.inputs || {};
        const sessionId = run.session_id || '';
        
        return inputs.conversationId === conversationId || 
               sessionId === conversationId ||
               run.id === conversationId;
      });

      if (!matchingRun) {
        const errorMsg = expectedRunId 
          ? `No LangSmith run found for conversation ID: ${conversationId} or expected run ID: ${expectedRunId}. Found ${runList.length} recent runs.`
          : `No LangSmith run found for conversation ID: ${conversationId}. Found ${runList.length} recent runs.`;
        
        return {
          success: false,
          error: errorMsg
        };
      }

      // Calculate response time if we have start and end times
      let responseTime = 0;
      if (matchingRun.start_time && matchingRun.end_time) {
        const start = new Date(matchingRun.start_time).getTime();
        const end = new Date(matchingRun.end_time).getTime();
        responseTime = end - start;
      }

      // Extract cost from outputs if available
      let cost = 0;
      if (matchingRun.outputs && typeof matchingRun.outputs.cost === 'number') {
        cost = matchingRun.outputs.cost;
      }

      return {
        success: true,
        runId: matchingRun.id,
        status: matchingRun.status,
        responseTime,
        cost
      };

    } catch (error: any) {
      return {
        success: false,
        error: `LangSmith validation error: ${error.message}`
      };
    }
  }

  /**
   * Get recent LangSmith runs for debugging
   */
  async getRecentRuns(limit: number = 5): Promise<any[]> {
    try {
      const runs = await this.langsmithClient.listRuns({
        projectName: LANGSMITH_PROJECT,
        limit
      });

      const runList = [];
      for await (const run of runs) {
        runList.push({
          id: run.id,
          name: run.name,
          status: run.status,
          startTime: run.start_time,
          endTime: run.end_time,
          sessionId: run.session_id,
          inputs: run.inputs,
          outputs: run.outputs
        });
      }

      return runList;
    } catch (error) {
      console.error('Failed to get recent runs:', error);
      return [];
    }
  }
}

// Export for use
export const productTest = new ProductTest();
