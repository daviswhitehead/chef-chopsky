import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'langsmith';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Chat API with direct LangSmith integration...');
    
    const { messages, userId, conversationId } = await request.json();
    
    // Create LangSmith client
    const langsmithClient = new Client({
      apiUrl: process.env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com',
      apiKey: process.env.LANGSMITH_API_KEY,
    });

    const projectName = process.env.LANGSMITH_PROJECT || 'chef chopsky';
    const runId = conversationId || crypto.randomUUID();
    
    console.log(`Creating LangSmith run: ${runId}`);
    console.log(`Project: ${projectName}`);
    console.log(`Messages: ${messages.length}`);
    
    // Create LangSmith run
    await langsmithClient.createRun({
      id: runId,
      name: 'chat-api-test',
      run_type: 'llm',
      project_name: projectName,
      inputs: {
        messages,
        userId: userId || 'anonymous',
        conversationId: runId,
        session_id: runId,
      },
    });
    
    console.log(`Successfully created LangSmith run: ${runId}`);

    return NextResponse.json({
      success: true,
      message: 'Chat API LangSmith integration working',
      runId: runId,
      projectName,
      messagesCount: messages.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Chat API LangSmith test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      projectName: process.env.LANGSMITH_PROJECT || 'chef chopsky',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
