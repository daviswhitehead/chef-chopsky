import { NextRequest, NextResponse } from 'next/server';
import { langsmithTests } from '../../../../lib/langsmith-tests';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Running LangSmith integration tests...');
    
    // Run all tests
    const testResults = await langsmithTests.runAllTests();
    
    // Get additional monitoring data
    const recentRuns = await langsmithTests.getRecentRuns(5);
    const projectStats = await langsmithTests.getProjectStats();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: testResults,
      monitoring: {
        recentRuns,
        projectStats
      }
    });
  } catch (error: any) {
    console.error('LangSmith test suite failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testType } = await request.json();
    
    switch (testType) {
      case 'connection':
        await langsmithTests['testLangSmithConnection']();
        break;
      case 'logging':
        await langsmithTests['testConversationLogging']();
        break;
      case 'completion':
        await langsmithTests['testRunCompletion']();
        break;
      case 'retrieval':
        await langsmithTests['testRunRetrieval']();
        break;
      case 'project':
        await langsmithTests['testProjectAccess']();
        break;
      case 'error':
        await langsmithTests['testErrorHandling']();
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid test type. Available: connection, logging, completion, retrieval, project, error'
        }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: `${testType} test completed`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error(`LangSmith ${testType} test failed:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
