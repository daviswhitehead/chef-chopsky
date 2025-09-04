import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages, userId, conversationId } = await request.json()

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano', // Cheapest text-based model ($0.025/$0.20 per 1M tokens)
      messages,
      max_completion_tokens: 2000,
    })

    return NextResponse.json({
      content: completion.choices[0]?.message?.content || '',
      model: completion.model,
      usage: completion.usage,
    })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    
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
