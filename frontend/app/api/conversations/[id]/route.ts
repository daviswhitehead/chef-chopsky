import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// GET /api/conversations/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = Math.random().toString(36).substr(2, 9);
  const { id } = await params;
  console.log(`[${requestId}] 🔍 GET /api/conversations/${id} - Request started`);
  
  try {
    console.log(`[${requestId}] 📝 Conversation ID: ${id}`);
    
    if (!id) {
      console.log(`[${requestId}] ❌ Missing conversation id`);
      return NextResponse.json({ error: 'Missing conversation id' }, { status: 400 });
    }

    // UUID v4 basic validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.log(`[${requestId}] ❌ Invalid UUID format: ${id}`);
      return NextResponse.json({ error: 'Invalid conversation id' }, { status: 400 });
    }

    console.log(`[${requestId}] ✅ UUID validation passed`);
    console.log(`[${requestId}] 🔍 Fetching conversation from database`);
    
    const conversation = await db.getConversation(id);
    if (!conversation) {
      console.log(`[${requestId}] ❌ Conversation not found: ${id}`);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    console.log(`[${requestId}] ✅ Conversation found:`, conversation.id);
    return NextResponse.json(conversation);
  } catch (error: any) {
    console.error(`[${requestId}] 💥 GET /api/conversations/:id error:`, error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}


