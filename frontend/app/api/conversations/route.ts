import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/database';
import { supabase } from '../../../lib/supabase';

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

    // If an explicit id is provided, create the conversation with that id directly
    if (id) {
      console.log('API: Creating conversation with explicit id via Supabase insert...');
      const { data, error } = await supabase
        .from('conversations')
        .insert({ id, user_id, title, metadata })
        .select()
        .single();

      if (error) {
        console.error('API: Supabase insert error:', error);
        return NextResponse.json(
          { error: 'Failed to create conversation with explicit id', details: error.message },
          { status: 500 }
        );
      }

      console.log('API: Created conversation with explicit id:', data?.id);
      return NextResponse.json(data);
    }

    // Otherwise, create conversation using database service
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


