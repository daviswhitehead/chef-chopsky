import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL

export async function POST(request: NextRequest) {
  try {
    if (!AGENT_SERVICE_URL) {
      return NextResponse.json(
        {
          error: 'Missing configuration',
          message: 'AGENT_SERVICE_URL is not set. Please configure it in your environment.'
        },
        { status: 500 }
      )
    }

    const { messages, userId, conversationId } = await request.json()

    if (!conversationId || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'conversationId and non-empty messages are required' },
        { status: 400 }
      )
    }

    // Get the last message (should be the user's message)
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Last message must be from user' },
        { status: 400 }
      )
    }

    // Ensure conversation exists, create if it doesn't
    try {
      await db.getConversation(conversationId)
    } catch (error) {
      // Conversation doesn't exist, create it with the specific ID
      const { supabase } = await import('@/lib/supabase')
      const { error: insertError } = await supabase
        .from('conversations')
        .insert({
          id: conversationId,
          user_id: userId ?? 'anonymous',
          title: `Conversation ${conversationId.slice(0, 8)}`,
          metadata: {
            source: 'frontend',
            created_via: 'api_chat'
          }
        })
      
      if (insertError) {
        console.error('Failed to create conversation:', insertError)
        // Continue anyway, might be a race condition
      }
    }

    // Persist user message to Supabase
    const userMessage = await db.addMessage(
      conversationId,
      'user',
      lastMessage.content,
      {
        user_id: userId ?? null,
        source: 'frontend',
        timestamp: new Date().toISOString()
      }
    )

    // Transform incoming messages (filter out system messages)
    const filtered = (messages as Array<{ role: string; content: string }>)
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }))

    const agentResponse = await fetch(`${AGENT_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        messages: filtered,
        client_metadata: {
          user_id: userId ?? null,
          source: 'frontend',
          user_agent: request.headers.get('user-agent') || 'unknown'
        }
      })
    })

    if (!agentResponse.ok) {
      const err = await safeJson(agentResponse)
      
      // Persist error message to Supabase
      await db.addMessage(
        conversationId,
        'assistant',
        'Sorry, I\'m having trouble connecting right now. This might be due to API limits or a temporary issue. Please try again later.',
        {
          error: true,
          error_details: err?.message || `Agent service error: ${agentResponse.status}`,
          timestamp: new Date().toISOString()
        }
      )
      
      return NextResponse.json(
        { error: 'Agent service error', message: err?.message || `Status ${agentResponse.status}` },
        { status: agentResponse.status }
      )
    }

    const data = await agentResponse.json()
    const assistantContent = data?.assistant_message?.content ?? ''
    
    // Persist assistant response to Supabase
    const assistantMessage = await db.addMessage(
      conversationId,
      'assistant',
      assistantContent,
      {
        model: data?.assistant_message?.model ?? 'openai/gpt-5-nano',
        usage: data?.assistant_message?.usage ?? { total_tokens: 0 },
        timing_ms: data?.timing_ms ?? 0,
        message_id: data?.assistant_message?.id,
        timestamp: new Date().toISOString()
      }
    )

    return NextResponse.json({
      content: assistantContent,
      model: data?.assistant_message?.model ?? 'openai/gpt-4o-mini',
      usage: data?.assistant_message?.usage ?? { total_tokens: 0 }
    })
  } catch (error: any) {
    console.error('Agent proxy error:', error)
    
    // Try to persist error message if we have conversationId
    try {
      const { conversationId } = await request.json()
      if (conversationId) {
        await db.addMessage(
          conversationId,
          'assistant',
          'Sorry, I\'m having trouble connecting right now. This might be due to API limits or a temporary issue. Please try again later.',
          {
            error: true,
            error_details: error?.message || 'Unknown error',
            timestamp: new Date().toISOString()
          }
        )
      }
    } catch (persistError) {
      console.error('Failed to persist error message:', persistError)
    }
    
    return NextResponse.json(
      { error: 'Failed to generate response', message: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

async function safeJson(res: Response) {
  try { return await res.json() } catch { return null }
}
