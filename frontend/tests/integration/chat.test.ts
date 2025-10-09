// Set environment variable before importing the route
process.env.AGENT_SERVICE_URL = 'http://localhost:3001'

// Stub Next.js server types used by the route
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({
      json: async () => body,
      status: init?.status ?? 200
    })
  },
  NextRequest: class {
    url: string
    method: string
    headers: Map<string, string>
    private _body: string
    constructor(url: string, init: any) {
      this.url = url
      this.method = init?.method || 'GET'
      this.headers = new Map(Object.entries(init?.headers || {}))
      this._body = init?.body || ''
    }
    async json() {
      return JSON.parse(this._body || '{}')
    }
  }
}))

import { POST } from '@/app/api/ai/chat/route'
import { NextRequest } from 'next/server'

// Mock the database
jest.mock('@/lib/database', () => ({
  db: {
    addMessage: jest.fn().mockResolvedValue({
      id: 'test-message-id',
      conversation_id: 'test-conversation',
      role: 'user',
      content: 'test message',
      timestamp: new Date().toISOString()
    }),
    // Force the route to go through the conversation creation path
    getConversation: jest.fn().mockRejectedValue(new Error('not found'))
  }
}))

// Mock Supabase client used for creating a conversation with a specific ID
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: () => ({ error: null })
    })
  }
}))

// Mock fetch for agent service
global.fetch = jest.fn()

describe('/api/ai/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response: any = await POST(request as any)
    expect(response.status).toBe(400)
  })

  it('should handle missing AGENT_SERVICE_URL', async () => {
    delete process.env.AGENT_SERVICE_URL
    
    const request = new NextRequest('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: '550e8400-e29b-41d4-a716-446655440000',
        messages: [{ role: 'user', content: 'test' }]
      })
    })

    const response: any = await POST(request as any)
    expect(response.status).toBe(502)
  })

  it('should call agent service and persist messages', async () => {
    // Mock successful agent response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        assistant_message: {
          id: 'assistant-123',
          role: 'assistant',
          content: 'Here is a simple dinner idea...',
          model: 'openai/gpt-5-nano',
          usage: { total_tokens: 100 }
        },
        timing_ms: 2000
      })
    })

    const request = new NextRequest('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'test-user',
        messages: [{ role: 'user', content: 'Give me a dinner idea' }]
      })
    })

    const response: any = await POST(request as any)
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.content).toBe('Here is a simple dinner idea...')
    expect(data.model).toBe('openai/gpt-5-nano')
  })
})
