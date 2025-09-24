import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, user_id, metadata } = body;

    console.log('API: Creating conversation with:', { title, user_id, metadata });

    // Validate required fields
    if (!title || !user_id) {
      console.log('API: Missing required fields:', { title, user_id });
      return NextResponse.json(
        { error: 'Missing required fields: title, user_id' },
        { status: 400 }
      );
    }

    // Create conversation
    console.log('API: Calling db.createConversation...');
    const conversation = await db.createConversation(user_id, title, metadata);
    console.log('API: Created conversation:', conversation);

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return NextResponse.json(
      { error: 'Failed to create conversation', details: error.message },
      { status: 500 }
    );
  }
}


