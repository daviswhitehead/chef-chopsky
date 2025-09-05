import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ConversationLogger } from '../../../../lib/conversation-logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  let conversationLogger: ConversationLogger | null = null
  
  try {
    const { messages, userId, conversationId } = await request.json()

    // Use conversationId as the runId (this is the conversation run ID from the frontend)
    const runId = conversationId || crypto.randomUUID()
    console.log(`Chat API: Using runId: ${runId}`)
    console.log(`Chat API: conversationId from frontend: ${conversationId}`)
    
    // Initialize conversation logger with runId as sessionId and runId
    conversationLogger = new ConversationLogger(runId, userId, runId)
    
    // Check if this run already exists
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )
    
    const { data: existingRun } = await supabaseClient
      .from('conversation_runs')
      .select('id')
      .eq('id', runId)
      .single()
    
    if (!existingRun) {
      // New conversation: start a new run
      console.log(`Chat API: Starting new run for conversationId: ${runId}`)
      await conversationLogger.startRun({
        messages,
        userId: userId || 'anonymous',
        conversationId: runId,
      })
      console.log(`Chat API: Successfully started run: ${runId}`)
    } else {
      // Existing conversation: check if LangSmith run exists, if not create it
      console.log(`Chat API: Supabase run exists, checking LangSmith...`)
      try {
        // Try to find the run in LangSmith
        const { Client } = await import('langsmith')
        const langsmithClient = new Client({
          apiUrl: process.env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com',
          apiKey: process.env.LANGSMITH_API_KEY,
        })
        const langsmithRun = await langsmithClient.readRun(runId)
        console.log(`Chat API: LangSmith run found: ${langsmithRun.id}`)
        conversationLogger.setRunId(runId)
      } catch (error) {
        // LangSmith run doesn't exist, create it
        console.log(`Chat API: LangSmith run not found, creating new one: ${runId}`)
        await conversationLogger.startRun({
          messages,
          userId: userId || 'anonymous',
          conversationId: runId,
        })
        console.log(`Chat API: Successfully created LangSmith run: ${runId}`)
      }
    }

    // Log user message (last message in the array)
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'user') {
      await conversationLogger.logMessage(
        'user',
        lastMessage.content,
        lastMessage.content.length / 4, // Rough token estimate
        0, // No response time for user messages
        0, // No cost for user messages
        { messageIndex: messages.length - 1 }
      )
    }

    const startTime = Date.now()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_completion_tokens: 2000,
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime
    const responseContent = completion.choices[0]?.message?.content || ''
    const tokenUsage = completion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    
    // Calculate cost (rough estimate for gpt-3.5-turbo)
    const cost = (tokenUsage.total_tokens / 1000) * 0.002 // $0.002 per 1K tokens

    // Log assistant response
    await conversationLogger.logMessage(
      'assistant',
      responseContent,
      tokenUsage.total_tokens,
      responseTime,
      cost,
      {
        model: completion.model,
        usage: tokenUsage,
        messageIndex: messages.length,
      }
    )

    // Note: We don't complete the run here - it should only be completed when the conversation actually ends
    // The run will remain 'active' until explicitly completed by the user or frontend

    return NextResponse.json({
      content: responseContent,
      model: completion.model,
      usage: tokenUsage,
      runId: runId,
      sessionId: runId, // Use runId as sessionId for consistency
    })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    
    // Log error using conversation logger
    try {
      if (conversationLogger) {
        await conversationLogger.logError(error, {
          errorCode: error.code,
          errorType: error.type,
          status: error.status,
        })
      }
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
    
    // Handle specific error types
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { 
          error: 'API quota exceeded',
          message: 'You have exceeded your OpenAI API quota. Please check your billing status at https://platform.openai.com/account/billing'
        },
        { status: 429 }
      )
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { 
          error: 'Invalid API key',
          message: 'Please check your OpenAI API key in your environment variables'
        },
        { status: 401 }
      )
    }
    
    // Log the specific error for debugging
    console.error('Specific error details:', {
      code: error.code,
      type: error.type,
      message: error.message,
      status: error.status
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        message: `API Error: ${error.message || 'Unknown error'}`
      },
      { status: 500 }
    )
  }
}
