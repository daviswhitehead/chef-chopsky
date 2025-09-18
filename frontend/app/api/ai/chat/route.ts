import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();
  
  console.log(`[${requestId}] 🚀 POST /api/ai/chat - Request started at ${new Date().toISOString()}`);
  
  let body: any;
  try {
    if (!AGENT_SERVICE_URL) {
      console.log(`[${requestId}] ❌ AGENT_SERVICE_URL not configured`);
      return NextResponse.json(
        { 
          error: 'Missing configuration',
          message: 'AGENT_SERVICE_URL is not set. Please configure it in your environment.'
        },
        { status: 500 }
      )
    }

    console.log(`[${requestId}] ✅ AGENT_SERVICE_URL configured: ${AGENT_SERVICE_URL}`);

    body = await request.json()
    const { messages, userId, conversationId } = body
    
    console.log(`[${requestId}] 📝 Request body parsed:`, {
      conversationId,
      userId,
      messagesCount: messages?.length,
      lastMessage: messages?.[messages.length - 1]
    });

    if (!conversationId || !Array.isArray(messages) || messages.length === 0) {
      console.log(`[${requestId}] ❌ Validation failed: missing required fields`);
      return NextResponse.json(
        { error: 'Invalid request', message: 'conversationId and non-empty messages are required' },
        { status: 400 }
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(conversationId)) {
      console.log(`[${requestId}] ❌ Invalid UUID format: ${conversationId}`);
      return NextResponse.json(
        { error: 'Invalid conversation ID', message: 'conversationId must be a valid UUID' },
        { status: 400 }
      )
    }
    
    console.log(`[${requestId}] ✅ Request validation passed`);

    // Get the last message (should be the user's message)
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Last message must be from user' },
        { status: 400 }
      )
    }

    // Ensure conversation exists, create if it doesn't
    console.log(`[${requestId}] 🔍 Checking if conversation exists: ${conversationId}`);
    try {
      const existingConv = await db.getConversation(conversationId)
      console.log(`[${requestId}] ✅ Conversation exists:`, existingConv?.id);
    } catch (error) {
      console.log(`[${requestId}] 📝 Conversation doesn't exist, creating new one`);
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
        console.error(`[${requestId}] ❌ Failed to create conversation:`, insertError)
        // Continue anyway, might be a race condition
      } else {
        console.log(`[${requestId}] ✅ Conversation created successfully`);
      }
    }

    // Persist user message to Supabase
    console.log(`[${requestId}] 💾 Persisting user message to Supabase`);
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
    console.log(`[${requestId}] ✅ User message persisted:`, userMessage?.id);

    // Transform incoming messages (filter out system messages)
    const filtered = (messages as Array<{ role: string; content: string }>)
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }))

    console.log(`[${requestId}] 🤖 Calling agent service with ${filtered.length} messages`);
    const agentStartTime = Date.now();
    
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
             }),
             // Increase timeout to match agent service response time
             signal: AbortSignal.timeout(30000) // 30 seconds
           })
    
    const agentDuration = Date.now() - agentStartTime;
    console.log(`[${requestId}] ⏱️ Agent service responded in ${agentDuration}ms with status ${agentResponse.status}`);

    if (!agentResponse.ok) {
      const err = await safeJson(agentResponse)
      console.log(`[${requestId}] ❌ Agent service error:`, err);
      
      // Persist error message to Supabase
      console.log(`[${requestId}] 💾 Persisting error message to Supabase`);
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
        { 
          error: 'Agent service error', 
          message: err?.message || `Status ${agentResponse.status}`,
          errorMessage: 'Sorry, I\'m having trouble connecting right now. This might be due to API limits or a temporary issue. Please try again later.'
        },
        { status: agentResponse.status }
      )
    }

    const data = await agentResponse.json()
    const assistantContent = data?.assistant_message?.content ?? ''
    
    // Validate response structure
    if (!data?.assistant_message?.content) {
      console.log(`[${requestId}] ❌ Invalid agent response structure:`, data);
      
      // Persist error message to Supabase
      await db.addMessage(
        conversationId,
        'assistant',
        'Sorry, I received an unexpected response format. Please try again.',
        {
          error: true,
          error_details: 'Invalid response structure from agent service',
          timestamp: new Date().toISOString()
        }
      )

      return NextResponse.json(
        { error: 'Invalid response', message: 'Agent service returned unexpected response format' },
        { status: 500 }
      )
    }
    
    console.log(`[${requestId}] ✅ Agent response received:`, {
      contentLength: assistantContent.length,
      model: data?.assistant_message?.model,
      timing: data?.timing_ms
    });
    
    // Persist assistant response to Supabase
    console.log(`[${requestId}] 💾 Persisting assistant message to Supabase`);
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
    console.log(`[${requestId}] ✅ Assistant message persisted:`, assistantMessage?.id);

    const totalDuration = Date.now() - startTime;
    console.log(`[${requestId}] 🎉 Request completed successfully in ${totalDuration}ms`);

    return NextResponse.json({
      content: assistantContent,
      model: data?.assistant_message?.model ?? 'openai/gpt-4o-mini',
      usage: data?.assistant_message?.usage ?? { total_tokens: 0 }
    })
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error(`[${requestId}] 💥 Agent proxy error after ${totalDuration}ms:`, error)
    
    // Try to persist error message if we have conversationId
    try {
      const { conversationId } = body || {}
      if (conversationId) {
        console.log(`[${requestId}] 💾 Attempting to persist error message`);
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
        console.log(`[${requestId}] ✅ Error message persisted`);
      }
    } catch (persistError) {
      console.error(`[${requestId}] ❌ Failed to persist error message:`, persistError)
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
