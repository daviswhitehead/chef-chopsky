import { Client } from 'langsmith';
import { DatabaseService } from './database';

// Test configuration
const LANGSMITH_PROJECT = process.env.LANGSMITH_PROJECT || 'chef chopsky';
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class SimpleProductTest {
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
   * Run a simple product test: create conversation -> send message -> check if ANY new LangSmith run was created
   */
  async runSimpleTest(): Promise<{
    success: boolean;
    conversationId?: string;
    messageContent?: string;
    newRunsFound?: number;
    error?: string;
    details?: any;
  }> {
    console.log('🧪 Starting Simple Product Test...');
    console.log('📝 This test will:');
    console.log('   1. Get current LangSmith run count');
    console.log('   2. Create a new conversation');
    console.log('   3. Send a test message');
    console.log('   4. Check if new LangSmith runs were created');
    console.log('');

    try {
      // Step 1: Get current run count
      console.log('1️⃣ Getting current LangSmith run count...');
      const initialRunCount = await this.getRunCount();
      console.log(`   📊 Current runs: ${initialRunCount}`);
      console.log('');

      // Step 2: Create a new conversation
      console.log('2️⃣ Creating new conversation...');
      const conversation = await this.createConversation();
      console.log(`   ✅ Conversation created: ${conversation.id}`);
      console.log(`   📋 Title: ${conversation.title}`);
      console.log('');

      // Step 3: Send a test message
      console.log('3️⃣ Sending test message...');
      const message = await this.sendMessage(conversation.id, 'Hello Chef Chopsky! Can you help me plan a simple dinner for tonight?');
      console.log(`   ✅ Message sent successfully`);
      console.log(`   🤖 AI Response: ${message.content.substring(0, 100)}...`);
      console.log('');

      // Step 4: Check if new runs were created
      console.log('4️⃣ Checking for new LangSmith runs...');
      console.log('   ⏳ Waiting 3 seconds for LangSmith to process...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const finalRunCount = await this.getRunCount();
      const newRunsFound = finalRunCount - initialRunCount;
      
      console.log(`   📊 Final runs: ${finalRunCount}`);
      console.log(`   📈 New runs created: ${newRunsFound}`);
      console.log('');

      if (newRunsFound > 0) {
        console.log('🎉 Simple product test PASSED! LangSmith integration is working.');
        console.log(`   ✅ ${newRunsFound} new run(s) created in LangSmith`);
        
        return {
          success: true,
          conversationId: conversation.id,
          messageContent: message.content,
          newRunsFound,
          details: {
            conversation: conversation,
            message: message,
            initialRunCount,
            finalRunCount,
            newRunsFound
          }
        };
      } else {
        console.log('💥 Simple product test FAILED! No new LangSmith runs were created.');
        console.log('   ❌ This suggests the LangSmith integration is not working');
        
        return {
          success: false,
          conversationId: conversation.id,
          messageContent: message.content,
          newRunsFound: 0,
          error: 'No new LangSmith runs were created',
          details: {
            conversation: conversation,
            message: message,
            initialRunCount,
            finalRunCount,
            newRunsFound: 0
          }
        };
      }

    } catch (error: any) {
      console.log(`💥 Simple product test FAILED with error: ${error.message}`);
      console.log('');
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get the current number of runs in LangSmith
   */
  private async getRunCount(): Promise<number> {
    try {
      const runs = await this.langsmithClient.listRuns({
        projectName: LANGSMITH_PROJECT,
        limit: 100 // Get more runs to get a better count
      });

      let count = 0;
      for await (const run of runs) {
        count++;
      }

      return count;
    } catch (error) {
      console.error('Failed to get run count:', error);
      return 0;
    }
  }

  /**
   * Create a new conversation using the database service
   */
  private async createConversation(): Promise<{ id: string; title: string }> {
    const title = `Simple Test ${new Date().toISOString()}`;
    const metadata = {
      csaBox: [],
      dietaryPreferences: [],
      mealCount: 10,
      prepTime: 120,
    };

    const conversation = await this.db.createConversation('test-user-simple', title, metadata);
    return {
      id: conversation.id,
      title: conversation.title
    };
  }

  /**
   * Send a message using the product chat API
   */
  private async sendMessage(conversationId: string, content: string): Promise<{ content: string }> {
    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: content }
        ],
        userId: 'test-user-simple',
        conversationId: conversationId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return {
      content: result.content
    };
  }
}

// Export for use
export const simpleProductTest = new SimpleProductTest();
