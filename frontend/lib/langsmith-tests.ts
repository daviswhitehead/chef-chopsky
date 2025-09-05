import { Client } from 'langsmith';
import { ConversationLogger } from './conversation-logger';

// Test configuration
const LANGSMITH_PROJECT = process.env.LANGSMITH_PROJECT || 'chef chopsky';
const TEST_USER_ID = 'test-user-123';

export class LangSmithTestSuite {
  private langsmithClient: Client;
  private testResults: Array<{
    testName: string;
    passed: boolean;
    error?: string;
    details?: any;
  }> = [];

  constructor() {
    this.langsmithClient = new Client({
      apiUrl: process.env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com',
      apiKey: process.env.LANGSMITH_API_KEY,
    });
  }

  /**
   * Run all LangSmith integration tests
   */
  async runAllTests(): Promise<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: Array<{ testName: string; passed: boolean; error?: string; details?: any }>;
  }> {
    console.log('🧪 Starting LangSmith Integration Tests...');
    
    // Clear previous results
    this.testResults = [];

    // Run all tests
    await this.testLangSmithConnection();
    await this.testConversationLogging();
    await this.testRunCompletion();
    await this.testRunRetrieval();
    await this.testProjectAccess();
    await this.testErrorHandling();

    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = this.testResults.filter(r => !r.passed).length;

    console.log(`\n📊 Test Results: ${passedTests}/${this.testResults.length} tests passed`);
    
    return {
      totalTests: this.testResults.length,
      passedTests,
      failedTests,
      results: this.testResults
    };
  }

  /**
   * Test 1: LangSmith Connection
   */
  private async testLangSmithConnection(): Promise<void> {
    try {
      console.log('🔌 Testing LangSmith connection...');
      
      // Try to list projects to verify connection
      const projects = await this.langsmithClient.listProjects();
      const projectList = [];
      for await (const project of projects) {
        projectList.push(project);
      }
      
      this.addTestResult('LangSmith Connection', true, {
        projectsFound: projectList.length,
        targetProject: LANGSMITH_PROJECT
      });
      
      console.log('✅ LangSmith connection successful');
    } catch (error) {
      this.addTestResult('LangSmith Connection', false, error.message);
      console.log('❌ LangSmith connection failed:', error.message);
    }
  }

  /**
   * Test 2: Conversation Logging
   */
  private async testConversationLogging(): Promise<void> {
    try {
      console.log('📝 Testing conversation logging...');
      
      const testSessionId = `test-session-${Date.now()}`;
      const conversationLogger = new ConversationLogger(testSessionId, TEST_USER_ID);
      
      // Start a test run
      const runId = await conversationLogger.startRun({
        messages: [{ role: 'user', content: 'Test message for LangSmith integration' }],
        userId: TEST_USER_ID,
        conversationId: testSessionId,
      });
      
      // Log a message
      await conversationLogger.logMessage(
        'user',
        'Test user message',
        10, // token count
        100, // response time
        0.001, // cost
        { testRun: true }
      );
      
      await conversationLogger.logMessage(
        'assistant',
        'Test assistant response',
        15,
        200,
        0.002,
        { testRun: true }
      );
      
      // Complete the run
      await conversationLogger.completeRun({
        content: 'Test conversation completed',
        model: 'gpt-3.5-turbo',
        usage: { total_tokens: 25 },
        responseTime: 300,
        cost: 0.003,
      });
      
      this.addTestResult('Conversation Logging', true, {
        runId,
        sessionId: testSessionId,
        messagesLogged: 2
      });
      
      console.log('✅ Conversation logging successful');
    } catch (error) {
      this.addTestResult('Conversation Logging', false, error.message);
      console.log('❌ Conversation logging failed:', error.message);
    }
  }

  /**
   * Test 3: Run Completion
   */
  private async testRunCompletion(): Promise<void> {
    try {
      console.log('🏁 Testing run completion...');
      
      const testSessionId = `test-completion-${Date.now()}`;
      const conversationLogger = new ConversationLogger(testSessionId, TEST_USER_ID);
      
      // Start and complete a run
      const runId = await conversationLogger.startRun({
        messages: [{ role: 'user', content: 'Test completion' }],
        userId: TEST_USER_ID,
        conversationId: testSessionId,
      });
      
      await conversationLogger.completeRun({
        content: 'Test completion successful',
        model: 'gpt-3.5-turbo',
        usage: { total_tokens: 20 },
        responseTime: 150,
        cost: 0.002,
      });
      
      // Verify the run is completed in LangSmith
      const run = await this.langsmithClient.readRun(runId);
      
      if (run.status === 'success') {
        this.addTestResult('Run Completion', true, {
          runId,
          status: run.status,
          endTime: run.end_time
        });
        console.log('✅ Run completion successful');
      } else {
        this.addTestResult('Run Completion', false, `Run status: ${run.status}`);
        console.log('❌ Run completion failed - status:', run.status);
      }
    } catch (error) {
      this.addTestResult('Run Completion', false, error.message);
      console.log('❌ Run completion test failed:', error.message);
    }
  }

  /**
   * Test 4: Run Retrieval
   */
  private async testRunRetrieval(): Promise<void> {
    try {
      console.log('🔍 Testing run retrieval...');
      
      // Get recent runs from our project
      const runs = await this.langsmithClient.listRuns({
        projectName: LANGSMITH_PROJECT,
        limit: 5
      });
      
      const runList = [];
      for await (const run of runs) {
        runList.push(run);
      }
      
      if (runList.length > 0) {
        // Test retrieving a specific run
        const testRun = runList[0];
        const retrievedRun = await this.langsmithClient.readRun(testRun.id);
        
        this.addTestResult('Run Retrieval', true, {
          totalRuns: runList.length,
          retrievedRunId: retrievedRun.id,
          runStatus: retrievedRun.status
        });
        console.log('✅ Run retrieval successful');
      } else {
        this.addTestResult('Run Retrieval', false, 'No runs found in project');
        console.log('❌ Run retrieval failed - no runs found');
      }
    } catch (error) {
      this.addTestResult('Run Retrieval', false, error.message);
      console.log('❌ Run retrieval test failed:', error.message);
    }
  }

  /**
   * Test 5: Project Access
   */
  private async testProjectAccess(): Promise<void> {
    try {
      console.log('📁 Testing project access...');
      
      // Try to access our specific project
      const runs = await this.langsmithClient.listRuns({
        projectName: LANGSMITH_PROJECT,
        limit: 1
      });
      
      const runList = [];
      for await (const run of runs) {
        runList.push(run);
      }
      
      this.addTestResult('Project Access', true, {
        projectName: LANGSMITH_PROJECT,
        accessible: true,
        recentRuns: runList.length
      });
      
      console.log('✅ Project access successful');
    } catch (error) {
      this.addTestResult('Project Access', false, error.message);
      console.log('❌ Project access failed:', error.message);
    }
  }

  /**
   * Test 6: Error Handling
   */
  private async testErrorHandling(): Promise<void> {
    try {
      console.log('🚨 Testing error handling...');
      
      const testSessionId = `test-error-${Date.now()}`;
      const conversationLogger = new ConversationLogger(testSessionId, TEST_USER_ID);
      
      // Start a run
      const runId = await conversationLogger.startRun({
        messages: [{ role: 'user', content: 'Test error handling' }],
        userId: TEST_USER_ID,
        conversationId: testSessionId,
      });
      
      // Simulate an error
      const testError = new Error('Test error for LangSmith integration');
      await conversationLogger.logError(testError, {
        errorCode: 'TEST_ERROR',
        errorType: 'validation',
        status: 400
      });
      
      this.addTestResult('Error Handling', true, {
        runId,
        errorLogged: true,
        errorMessage: testError.message
      });
      
      console.log('✅ Error handling successful');
    } catch (error) {
      this.addTestResult('Error Handling', false, error.message);
      console.log('❌ Error handling test failed:', error.message);
    }
  }

  /**
   * Add test result
   */
  private addTestResult(testName: string, passed: boolean, details?: any, error?: string): void {
    this.testResults.push({
      testName,
      passed,
      error,
      details
    });
  }

  /**
   * Get recent runs for monitoring
   */
  async getRecentRuns(limit: number = 10): Promise<any[]> {
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
          inputs: run.inputs,
          outputs: run.outputs,
          error: run.error
        });
      }
      
      return runList;
    } catch (error) {
      console.error('Failed to get recent runs:', error);
      return [];
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(): Promise<{
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageResponseTime: number;
    totalCost: number;
  }> {
    try {
      const runs = await this.langsmithClient.listRuns({
        projectName: LANGSMITH_PROJECT,
        limit: 100 // Get last 100 runs for stats
      });

      const runList = [];
      for await (const run of runs) {
        runList.push(run);
      }

      const successfulRuns = runList.filter(run => run.status === 'success').length;
      const failedRuns = runList.filter(run => run.status === 'error').length;
      
      // Calculate average response time
      const responseTimes = runList
        .filter(run => run.start_time && run.end_time)
        .map(run => {
          const start = new Date(run.start_time!).getTime();
          const end = new Date(run.end_time!).getTime();
          return end - start;
        });
      
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;

      // Calculate total cost (if available in outputs)
      const totalCost = runList.reduce((sum, run) => {
        const cost = run.outputs?.cost || 0;
        return sum + (typeof cost === 'number' ? cost : 0);
      }, 0);

      return {
        totalRuns: runList.length,
        successfulRuns,
        failedRuns,
        averageResponseTime,
        totalCost
      };
    } catch (error) {
      console.error('Failed to get project stats:', error);
      return {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageResponseTime: 0,
        totalCost: 0
      };
    }
  }
}

// Export for use in API routes or other modules
export const langsmithTests = new LangSmithTestSuite();
