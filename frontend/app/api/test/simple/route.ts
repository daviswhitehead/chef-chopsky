import { NextRequest, NextResponse } from 'next/server';
import { simpleProductTest } from '../../../../lib/simple-product-test';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Running Simple Product Test...');
    
    const result = await simpleProductTest.runSimpleTest();
    
    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      conversationId: result.conversationId,
      messageContent: result.messageContent,
      newRunsFound: result.newRunsFound,
      error: result.error,
      details: result.details
    });
  } catch (error: any) {
    console.error('Simple product test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
