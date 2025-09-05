import { NextRequest, NextResponse } from 'next/server';
import { productTest } from '../../../../lib/product-test';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Running Product Test...');
    
    const result = await productTest.runProductTest();
    
    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      conversationId: result.conversationId,
      messageId: result.messageId,
      langsmithRunId: result.langsmithRunId,
      error: result.error,
      details: result.details
    });
  } catch (error: any) {
    console.error('Product test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'recent-runs') {
      const recentRuns = await productTest.getRecentRuns(10);
      return NextResponse.json({
        success: true,
        recentRuns,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Available: recent-runs'
    }, { status: 400 });
  } catch (error: any) {
    console.error('Product test action failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
