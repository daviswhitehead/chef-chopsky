import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'langsmith';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing direct LangSmith integration...');
    
    const langsmithClient = new Client({
      apiUrl: process.env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com',
      apiKey: process.env.LANGSMITH_API_KEY,
    });

    const projectName = process.env.LANGSMITH_PROJECT || 'chef chopsky';
    console.log(`Using project: ${projectName}`);
    console.log(`API Key exists: ${!!process.env.LANGSMITH_API_KEY}`);
    console.log(`Endpoint: ${process.env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com'}`);

    // Try to create a simple run with proper UUID
    const testRunId = crypto.randomUUID();
    console.log(`Creating test run: ${testRunId}`);
    
    await langsmithClient.createRun({
      id: testRunId,
      name: 'direct-test-run',
      run_type: 'llm',
      project_name: projectName,
      inputs: {
        test: true,
        message: 'Direct LangSmith test'
      },
    });

    console.log(`Successfully created run: ${testRunId}`);

    return NextResponse.json({
      success: true,
      message: 'Direct LangSmith integration working - run created successfully',
      runId: testRunId,
      projectName,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Direct LangSmith test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      projectName: process.env.LANGSMITH_PROJECT || 'chef chopsky',
      apiKeyExists: !!process.env.LANGSMITH_API_KEY,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
