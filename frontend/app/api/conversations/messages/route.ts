import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// POST /api/conversations/messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation_id, role, content, metadata } = body;

    console.log('API: Creating message with:', { conversation_id, role, content: content?.substring(0, 50) + '...', metadata });

    // Validate required fields
    if (!conversation_id || !role || !content) {
      console.log('API: Missing required fields:', { conversation_id, role, content: !!content });
      return NextResponse.json(
        { error: 'Missing required fields: conversation_id, role, content' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversation_id)) {
      console.log('API: Invalid UUID format:', conversation_id);
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['user', 'assistant'].includes(role)) {
      console.log('API: Invalid role:', role);
      return NextResponse.json(
        { error: 'Invalid role. Must be "user" or "assistant"' },
        { status: 400 }
      );
    }

    console.log('API: Calling db.addMessage...');
    const message = await db.addMessage(conversation_id, role, content, metadata);
    console.log('API: Created message:', message);

    return NextResponse.json(message);
  } catch (error: any) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message', details: error.message },
      { status: 500 }
    );
  }
}
