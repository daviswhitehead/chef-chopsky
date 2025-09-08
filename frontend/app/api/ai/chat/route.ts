import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ConversationLogger } from '../../../../lib/conversation-logger'
import crypto from 'crypto'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  let conversationLogger: ConversationLogger | null = null
  
  try {
    const { messages, userId, conversationId } = await request.json()

    // Create a unique run ID for each message exchange
    const runId = crypto.randomUUID()
    console.log(`Chat API: Using runId: ${runId}`)
    console.log(`Chat API: conversationId from frontend: ${conversationId}`)
    
    // Initialize conversation logger with runId as sessionId and runId
    conversationLogger = new ConversationLogger(runId, userId, runId)
    
    // Always create a new LangSmith run for each message exchange
    console.log(`Chat API: Creating new LangSmith run: ${runId}`)
    try {
      await conversationLogger.startRun({
        messages,
        userId: userId || 'anonymous',
        conversationId: runId,
      })
      console.log(`Chat API: Successfully created LangSmith run: ${runId}`)
    } catch (error) {
      console.error(`Chat API: Failed to create LangSmith run ${runId}:`, error)
      throw error // Re-throw to see the error in the test
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

    // Complete the run to mark it as successful in LangSmith
    try {
      await conversationLogger.completeRun({
        content: responseContent,
        model: completion.model,
        usage: tokenUsage,
        responseTime,
        cost,
      })
      console.log(`Chat API: Successfully completed LangSmith run: ${runId}`)
    } catch (error) {
      console.error(`Chat API: Failed to complete LangSmith run ${runId}:`, error)
      console.error('Error details:', error.message, error.stack)
      // Don't throw - we still want to return the response even if LangSmith completion fails
    }

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
