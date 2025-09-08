import { NextRequest, NextResponse } from 'next/server';
import { langsmithTests } from '../../../../../lib/langsmith-tests';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Monitoring API: Fetching LangSmith data...');
    const recentRuns = await langsmithTests.getRecentRuns(3);
    console.log(`📊 Monitoring API: Returning ${recentRuns.length} runs`);
    
    return NextResponse.json({
      success: true,
      monitoring: { recentRuns }
    });
  } catch (error: any) {
    console.error('❌ Monitoring API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
