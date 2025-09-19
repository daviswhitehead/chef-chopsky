import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, user_id, metadata } = body;

    // Validate required fields
    if (!title || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, user_id' },
        { status: 400 }
      );
    }

    // Create conversation
    const conversation = await db.createConversation(user_id, title, metadata);

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}


