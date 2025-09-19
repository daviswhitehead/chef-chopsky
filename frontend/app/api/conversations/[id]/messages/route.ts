import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// GET /api/conversations/:id/messages
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing conversation id' }, { status: 400 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid conversation id' }, { status: 400 });
    }

    const messages = await db.getMessagesByConversation(id);
    return NextResponse.json(messages || []);
  } catch (error: any) {
    console.error('GET /api/conversations/:id/messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}


