#!/usr/bin/env node

/**
 * Cursor CLI Integration for CI Failure Analysis
 * 
 * This script replaces the placeholder analysis with real Cursor CLI integration
 * to analyze CI failures and generate targeted fixes.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  cursorModel: 'gpt-4',
  maxAnalysisTime: 300000, // 5 minutes
  outputFile: 'AUTO_FIX_ANALYSIS.md'
};

/**
 * Main analysis function
 */
async function analyzeCIFailure() {
  console.log('🔍 Starting Cursor CLI analysis...');
  
  try {
    // Check if Cursor CLI is available
    await checkCursorCLI();
    
    // Gather failure context
    const context = await gatherFailureContext();
    
    // Run Cursor analysis
    const analysis = await runCursorAnalysis(context);
    
    // Generate fix recommendations
    const recommendations = await generateFixRecommendations(analysis);
    
    // Create analysis report
    await createAnalysisReport(context, analysis, recommendations);
    
    console.log('✅ Cursor analysis complete!');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    await createFallbackAnalysis(error);
  }
}

/**
 * Check if Cursor CLI is installed and configured
 */
async function checkCursorCLI() {
  try {
    // Check if cursor-agent command exists
    execSync('cursor-agent --version', { stdio: 'pipe' });
    console.log('✅ Cursor CLI is available');
    
    // Check if API key is configured
    if (!process.env.CURSOR_API_KEY) {
      throw new Error('CURSOR_API_KEY environment variable is not set');
    }
    console.log('✅ Cursor API key is configured');
    
  } catch (error) {
    throw new Error(`Cursor CLI not properly configured: ${error.message}`);
  }
}

/**
 * Gather context about the CI failure
 */
async function gatherFailureContext() {
  const context = {
    workflowRunUrl: process.env.WORKFLOW_RUN_URL || 'Unknown',
    prNumber: process.env.PR_NUMBER || 'Unknown',
    fixBranch: process.env.FIX_BRANCH || 'Unknown',
    timestamp: new Date().toISOString(),
    repository: process.env.GITHUB_REPOSITORY || 'Unknown',
    headBranch: process.env.HEAD_BRANCH || 'Unknown'
  };
  
  // Try to get recent CI logs (if available)
  try {
    context.recentLogs = await getRecentCILogs();
  } catch (error) {
    console.log('⚠️ Could not retrieve CI logs:', error.message);
    context.recentLogs = 'CI logs not available';
  }
  
  // Get repository structure
  context.repositoryStructure = await getRepositoryStructure();
  
  return context;
}

/**
 * Run Cursor CLI analysis
 */
async function runCursorAnalysis(context) {
  console.log('🤖 Running Cursor AI analysis...');
  
  const prompt = createAnalysisPrompt(context);
  
  try {
    // Use cursor-agent to analyze the failure
    const command = `cursor-agent --prompt "${prompt}" --model ${CONFIG.cursorModel}`;
    
    console.log('Running Cursor CLI command...');
    const result = execSync(command, { 
      encoding: 'utf8',
      timeout: CONFIG.maxAnalysisTime,
      stdio: 'pipe'
    });
    
    return {
      success: true,
      analysis: result.trim(),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Cursor CLI analysis failed:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Create analysis prompt for Cursor CLI
 */
function createAnalysisPrompt(context) {
  return `
Analyze this CI failure and provide a detailed fix recommendation:

CONTEXT:
- Repository: ${context.repository}
- PR Number: ${context.prNumber}
- Branch: ${context.headBranch}
- Workflow Run: ${context.workflowRunUrl}
- Fix Branch: ${context.fixBranch}

REPOSITORY STRUCTURE:
${context.repositoryStructure}

RECENT CI LOGS:
${context.recentLogs}

Please provide:
1. Root cause analysis of the CI failure
2. Specific code changes needed to fix the issue
3. Step-by-step fix instructions
4. Any potential risks or considerations
5. Testing recommendations

Focus on common CI failure types:
- ESLint/Prettier errors
- TypeScript compilation errors
- Jest test failures
- Playwright E2E test failures
- Dependency/npm issues
- Build configuration problems

Provide actionable, specific recommendations that can be implemented immediately.
`;
}

/**
 * Generate fix recommendations based on analysis
 */
async function generateFixRecommendations(analysis) {
  if (!analysis.success) {
    return {
      status: 'failed',
      message: 'Analysis failed, using fallback recommendations',
      recommendations: getFallbackRecommendations()
    };
  }
  
  // Parse the Cursor analysis and extract recommendations
  const recommendations = parseAnalysisOutput(analysis.analysis);
  
  return {
    status: 'success',
    recommendations: recommendations,
    confidence: 'high'
  };
}

/**
 * Parse Cursor CLI output to extract recommendations
 */
function parseAnalysisOutput(analysis) {
  // This is a simplified parser - in practice, you'd want more sophisticated parsing
  const lines = analysis.split('\n');
  const recommendations = [];
  
  let currentRecommendation = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.match(/^\d+\./)) {
      // New numbered recommendation
      if (currentRecommendation) {
        recommendations.push(currentRecommendation);
      }
      currentRecommendation = {
        title: trimmed,
        description: '',
        code: '',
        priority: 'medium'
      };
    } else if (currentRecommendation && trimmed) {
      // Add to current recommendation
      if (trimmed.startsWith('```')) {
        currentRecommendation.code += trimmed + '\n';
      } else {
        currentRecommendation.description += trimmed + '\n';
      }
    }
  }
  
  if (currentRecommendation) {
    recommendations.push(currentRecommendation);
  }
  
  return recommendations.length > 0 ? recommendations : getFallbackRecommendations();
}

/**
 * Get fallback recommendations when analysis fails
 */
function getFallbackRecommendations() {
  return [
    {
      title: '1. Run ESLint Fix',
      description: 'Automatically fix ESLint errors',
      code: 'npm run lint:fix',
      priority: 'high'
    },
    {
      title: '2. Run Prettier Format',
      description: 'Format code with Prettier',
      code: 'npm run format',
      priority: 'high'
    },
    {
      title: '3. Check TypeScript Errors',
      description: 'Review and fix TypeScript compilation errors',
      code: 'npm run type-check',
      priority: 'medium'
    },
    {
      title: '4. Run Tests',
      description: 'Execute test suite to identify failing tests',
      code: 'npm run test',
      priority: 'medium'
    },
    {
      title: '5. Install Dependencies',
      description: 'Ensure all dependencies are properly installed',
      code: 'npm install',
      priority: 'low'
    }
  ];
}

/**
 * Get recent CI logs (placeholder implementation)
 */
async function getRecentCILogs() {
  // In a real implementation, you'd fetch actual CI logs
  // For now, return a placeholder
  return `
Recent CI logs would be fetched from GitHub API here.
This would include:
- Build output
- Test results
- Error messages
- Stack traces
`;
}

/**
 * Get repository structure
 */
async function getRepositoryStructure() {
  try {
    const result = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | head -20', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return result.trim();
  } catch (error) {
    return 'Could not retrieve repository structure';
  }
}

/**
 * Create analysis report
 */
async function createAnalysisReport(context, analysis, recommendations) {
  const report = `# Auto-Fix Analysis Report

## CI Failure Context
- **Repository**: ${context.repository}
- **PR Number**: ${context.prNumber}
- **Branch**: ${context.headBranch}
- **Workflow Run**: ${context.workflowRunUrl}
- **Fix Branch**: ${context.fixBranch}
- **Analysis Date**: ${context.timestamp}

## Cursor AI Analysis
${analysis.success ? '✅ Analysis completed successfully' : '❌ Analysis failed'}

${analysis.success ? analysis.analysis : `Error: ${analysis.error}`}

## Fix Recommendations
${recommendations.status === 'success' ? '✅ Recommendations generated' : '⚠️ Using fallback recommendations'}

${recommendations.recommendations.map((rec, index) => `
### ${rec.title}
**Priority**: ${rec.priority}
**Description**: ${rec.description}

\`\`\`bash
${rec.code}
\`\`\`
`).join('\n')}

## Next Steps
1. Review the analysis and recommendations above
2. Apply the appropriate fixes to resolve the CI failure
3. Test the fixes locally before pushing
4. Create a PR from the fix branch for review

---
*Generated by Cursor CLI Auto-Fix System*
`;

  fs.writeFileSync(CONFIG.outputFile, report);
  console.log(`📄 Analysis report saved to ${CONFIG.outputFile}`);
}

/**
 * Create fallback analysis when Cursor CLI fails
 */
async function createFallbackAnalysis(error) {
  const fallbackReport = `# Auto-Fix Analysis Report (Fallback)

## CI Failure Context
- **Analysis Date**: ${new Date().toISOString()}
- **Status**: Fallback analysis due to Cursor CLI error

## Error Details
\`\`\`
${error.message}
\`\`\`

## Fix Recommendations
⚠️ Using fallback recommendations due to Cursor CLI error

### 1. ESLint Errors
**Priority**: high
**Description**: Automatically fix ESLint errors

\`\`\`bash
npm run lint:fix
\`\`\`

### 2. Prettier Formatting
**Priority**: high
**Description**: Format code with Prettier

\`\`\`bash
npm run format
\`\`\`

### 3. TypeScript Errors
**Priority**: medium
**Description**: Check type definitions

\`\`\`bash
npm run type-check
\`\`\`

### 4. Test Failures
**Priority**: medium
**Description**: Review test logic and assertions

\`\`\`bash
npm run test
\`\`\`

### 5. Dependency Issues
**Priority**: low
**Description**: Ensure all dependencies are properly installed

\`\`\`bash
npm install
\`\`\`

## Next Steps
1. Try the common fixes above
2. Check the CI logs for specific error messages
3. Manually analyze the failure and apply appropriate fixes
4. Consider setting up Cursor CLI properly for future automated analysis

---
*Generated by Auto-Fix System (Fallback Mode)*
`;

  fs.writeFileSync(CONFIG.outputFile, fallbackReport);
  console.log(`📄 Fallback analysis report saved to ${CONFIG.outputFile}`);
}

// Run the analysis
if (require.main === module) {
  analyzeCIFailure().catch(console.error);
}

module.exports = { analyzeCIFailure };
