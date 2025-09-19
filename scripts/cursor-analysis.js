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
  
  // Get comprehensive failure context
  try {
    context.failedChecks = await getFailedChecks();
    context.recentLogs = await getRecentCILogs();
    context.environmentInfo = await getEnvironmentInfo();
    context.changedFiles = await getChangedFiles();
    context.repositoryStructure = await getRepositoryStructure();
    context.recentCommits = await getRecentCommits();
  } catch (error) {
    console.log('⚠️ Could not retrieve some context:', error.message);
  }
  
  return context;
}

/**
 * Run Cursor CLI analysis
 */
async function runCursorAnalysis(context) {
  console.log('🤖 Running Cursor AI analysis...');
  
  const prompt = createAnalysisPrompt(context);
  
  try {
    // Write prompt to temporary file to avoid shell quote issues
    const fs = require('fs');
    const path = require('path');
    const tempFile = path.join(process.cwd(), 'cursor-prompt.txt');
    
    fs.writeFileSync(tempFile, prompt, 'utf8');
    
    console.log('Testing Cursor CLI command formats...');
    
    // First, let's see what cursor-agent actually supports
    try {
      const helpResult = execSync('cursor-agent --help', { 
        encoding: 'utf8',
        timeout: 10000,
        stdio: 'pipe'
      });
      console.log('Cursor CLI help output:', helpResult);
    } catch (helpError) {
      console.log('Help command failed:', helpError.message);
    }
    
    // Try the main analysis command with file input
    const command = `cursor-agent --print "$(cat ${tempFile})"`;
    console.log('Running Cursor CLI command...');
    const result = execSync(command, { 
      encoding: 'utf8',
      timeout: CONFIG.maxAnalysisTime,
      stdio: 'pipe'
    });
    
    // Clean up temp file
    try {
      fs.unlinkSync(tempFile);
    } catch (cleanupError) {
      console.log('Could not clean up temp file:', cleanupError.message);
    }
    
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
 * Get failed GitHub checks
 */
async function getFailedChecks() {
  try {
    // Try to get check runs from GitHub API
    const result = execSync('gh api repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/check-runs --jq ".check_runs[] | select(.conclusion == \"failure\") | {name: .name, status: .status, conclusion: .conclusion, html_url: .html_url}"', { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 10000
    });
    return result.trim() || 'No failed checks found via API';
  } catch (error) {
    // Fallback: try to get recent CI output
    try {
      const ciOutput = execSync('npm run test 2>&1 | head -50', { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 15000
      });
      return `Recent CI output:\n${ciOutput}`;
    } catch (ciError) {
      return 'Could not retrieve failed checks or CI output';
    }
  }
}

/**
 * Get recent CI logs with error details
 */
async function getRecentCILogs() {
  try {
    // Get recent build/test output
    const commands = [
      'npm run build 2>&1 | tail -100',
      'npm run test 2>&1 | tail -100', 
      'npm run lint 2>&1 | tail -50',
      'npm run type-check 2>&1 | tail -50'
    ];
    
    const logs = {};
    for (const cmd of commands) {
      try {
        const output = execSync(cmd, { 
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 10000
        });
        const commandName = cmd.split(' ')[2]; // Extract command name
        logs[commandName] = output.trim();
      } catch (error) {
        logs[cmd.split(' ')[2]] = `Error running ${cmd}: ${error.message}`;
      }
    }
    
    return JSON.stringify(logs, null, 2);
  } catch (error) {
    return `Could not retrieve CI logs: ${error.message}`;
  }
}

/**
 * Get environment information
 */
async function getEnvironmentInfo() {
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    const osInfo = execSync('uname -a', { encoding: 'utf8', stdio: 'pipe' }).trim();
    
    return {
      nodeVersion,
      npmVersion,
      osInfo,
      workingDirectory: process.cwd()
    };
  } catch (error) {
    return `Could not retrieve environment info: ${error.message}`;
  }
}

/**
 * Get changed files in the current branch
 */
async function getChangedFiles() {
  try {
    // Get files changed in the last few commits
    const changedFiles = execSync('git diff --name-only HEAD~3..HEAD', { 
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    
    const statusFiles = execSync('git status --porcelain', { 
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    
    return {
      recentChanges: changedFiles.split('\n').filter(f => f),
      currentStatus: statusFiles.split('\n').filter(f => f)
    };
  } catch (error) {
    return `Could not retrieve changed files: ${error.message}`;
  }
}

/**
 * Get recent commits
 */
async function getRecentCommits() {
  try {
    const commits = execSync('git log --oneline -5', { 
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    return commits.split('\n');
  } catch (error) {
    return `Could not retrieve recent commits: ${error.message}`;
  }
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
 * Create analysis report with enhanced context for Cursor sessions
 */
async function createAnalysisReport(context, analysis, recommendations) {
  const report = `# CI Failure Analysis - Ready for Cursor Session

## 📋 Context Summary
- **Repository**: ${context.repository}
- **PR Number**: ${context.prNumber}
- **Branch**: ${context.headBranch}
- **Fix Branch**: ${context.fixBranch}
- **Workflow Run**: ${context.workflowRunUrl}
- **Analysis Date**: ${context.timestamp}

## ❌ Failed Checks
${context.failedChecks || 'No failed checks detected'}

## 🔍 Error Logs & Details
${context.recentLogs || 'No recent logs available'}

## 🖥️ Environment Info
${typeof context.environmentInfo === 'object' 
  ? Object.entries(context.environmentInfo).map(([key, value]) => `- **${key}**: ${value}`).join('\n')
  : context.environmentInfo || 'Environment info not available'}

## 📁 Changed Files
${context.changedFiles ? `
**Recent Changes:**
${context.changedFiles.recentChanges ? context.changedFiles.recentChanges.map(f => `- ${f}`).join('\n') : 'None'}

**Current Status:**
${context.changedFiles.currentStatus ? context.changedFiles.currentStatus.map(f => `- ${f}`).join('\n') : 'None'}
` : 'File changes not available'}

## 📝 Recent Commits
${context.recentCommits ? context.recentCommits.map(c => `- ${c}`).join('\n') : 'Recent commits not available'}

## 🤖 Cursor AI Analysis
${analysis.success ? '✅ Analysis completed successfully' : '❌ Analysis failed'}

${analysis.success ? analysis.analysis : `Error: ${analysis.error}`}

## 🔧 Fix Recommendations
${recommendations.status === 'success' ? '✅ Recommendations generated' : '⚠️ Using fallback recommendations'}

${recommendations.recommendations.map((rec, index) => `
### ${rec.title}
**Priority**: ${rec.priority}
**Description**: ${rec.description}

\`\`\`bash
${rec.code}
\`\`\`
`).join('\n')}

---

## 🚀 Ready-to-Paste Cursor Session Prompt

Copy the prompt below and paste it into a new Cursor session for interactive debugging:

\`\`\`
# CI Failure Debugging Session

## Context
I'm debugging a CI failure in the ${context.repository} repository. Here are the details:

**Branch**: ${context.headBranch}
**PR**: #${context.prNumber}
**Workflow**: ${context.workflowRunUrl}

## Failed Checks
${context.failedChecks || 'No specific failed checks identified'}

## Error Details
${context.recentLogs || 'No recent error logs available'}

## Environment
${typeof context.environmentInfo === 'object' 
  ? Object.entries(context.environmentInfo).map(([key, value]) => `- ${key}: ${value}`).join('\n')
  : context.environmentInfo || 'Environment info not available'}

## Files Changed Recently
${context.changedFiles && context.changedFiles.recentChanges 
  ? context.changedFiles.recentChanges.map(f => `- ${f}`).join('\n')
  : 'No recent file changes detected'}

## Recent Commits
${context.recentCommits ? context.recentCommits.map(c => `- ${c}`).join('\n') : 'No recent commits available'}

## What I Need Help With
Please help me:
1. Identify the root cause of the CI failure
2. Provide specific fixes for the issues
3. Suggest a debugging approach
4. Help me test the fixes

## Suggested Debugging Approach
1. Start by running \`npm run type-check\` to see TypeScript errors
2. Then run \`npm run test\` to identify failing tests
3. Check \`npm run lint\` for code quality issues
4. Review the changed files above for potential issues

Please analyze the error logs and provide targeted fixes.
\`\`\`

## 🎯 Quick Actions
1. **Copy the prompt above** and paste into Cursor
2. **Open the repository** in Cursor: \`${context.environmentInfo?.workingDirectory || process.cwd()}\`
3. **Run diagnostic commands**:
   - \`npm run type-check\` - Check TypeScript errors
   - \`npm run test\` - Run tests
   - \`npm run lint\` - Check linting
   - \`npm run build\` - Test build process

## 📚 Repository Structure
${context.repositoryStructure || 'Repository structure not available'}

---
*Generated by Cursor CLI Auto-Fix System - Enhanced for Interactive Debugging*
`;

  fs.writeFileSync(CONFIG.outputFile, report);
  console.log(`📄 Enhanced analysis report saved to ${CONFIG.outputFile}`);
  console.log(`🎯 Copy-paste ready Cursor prompt included!`);
}

/**
 * Create fallback analysis when Cursor CLI fails
 */
async function createFallbackAnalysis(error) {
  // Gather basic context even in fallback mode
  const context = {
    timestamp: new Date().toISOString(),
    repository: process.env.GITHUB_REPOSITORY || 'Unknown',
    prNumber: process.env.PR_NUMBER || 'Unknown',
    headBranch: process.env.HEAD_BRANCH || 'Unknown',
    workflowRunUrl: process.env.WORKFLOW_RUN_URL || 'Unknown'
  };

  // Try to get some basic context even in fallback
  try {
    context.environmentInfo = await getEnvironmentInfo();
    context.changedFiles = await getChangedFiles();
    context.recentCommits = await getRecentCommits();
  } catch (contextError) {
    console.log('Could not gather context in fallback mode:', contextError.message);
  }

  const fallbackReport = `# CI Failure Analysis - Fallback Mode (Ready for Cursor Session)

## 📋 Context Summary
- **Repository**: ${context.repository}
- **PR Number**: ${context.prNumber}
- **Branch**: ${context.headBranch}
- **Workflow Run**: ${context.workflowRunUrl}
- **Analysis Date**: ${context.timestamp}
- **Status**: ⚠️ Fallback analysis due to Cursor CLI error

## ❌ Cursor CLI Error
\`\`\`
${error.message}
\`\`\`

## 🖥️ Environment Info
${typeof context.environmentInfo === 'object' 
  ? Object.entries(context.environmentInfo).map(([key, value]) => `- **${key}**: ${value}`).join('\n')
  : context.environmentInfo || 'Environment info not available'}

## 📁 Changed Files
${context.changedFiles ? `
**Recent Changes:**
${context.changedFiles.recentChanges ? context.changedFiles.recentChanges.map(f => `- ${f}`).join('\n') : 'None'}

**Current Status:**
${context.changedFiles.currentStatus ? context.changedFiles.currentStatus.map(f => `- ${f}`).join('\n') : 'None'}
` : 'File changes not available'}

## 📝 Recent Commits
${context.recentCommits ? context.recentCommits.map(c => `- ${c}`).join('\n') : 'Recent commits not available'}

## 🔧 Fallback Fix Recommendations
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

---

## 🚀 Ready-to-Paste Cursor Session Prompt

Copy the prompt below and paste it into a new Cursor session for interactive debugging:

\`\`\`
# CI Failure Debugging Session (Fallback Mode)

## Context
I'm debugging a CI failure in the ${context.repository} repository. The automated Cursor CLI analysis failed, so I need help with manual debugging.

**Branch**: ${context.headBranch}
**PR**: #${context.prNumber}
**Workflow**: ${context.workflowRunUrl}

## Cursor CLI Error
The automated analysis failed with: ${error.message}

## Environment
${typeof context.environmentInfo === 'object' 
  ? Object.entries(context.environmentInfo).map(([key, value]) => `- ${key}: ${value}`).join('\n')
  : context.environmentInfo || 'Environment info not available'}

## Files Changed Recently
${context.changedFiles && context.changedFiles.recentChanges 
  ? context.changedFiles.recentChanges.map(f => `- ${f}`).join('\n')
  : 'No recent file changes detected'}

## Recent Commits
${context.recentCommits ? context.recentCommits.map(c => `- ${c}`).join('\n') : 'No recent commits available'}

## What I Need Help With
Please help me:
1. Identify the root cause of the CI failure
2. Provide specific fixes for the issues
3. Suggest a debugging approach
4. Help me test the fixes

## Suggested Debugging Approach
1. Start by running \`npm run type-check\` to see TypeScript errors
2. Then run \`npm run test\` to identify failing tests
3. Check \`npm run lint\` for code quality issues
4. Review the changed files above for potential issues

Please analyze the situation and provide targeted fixes.
\`\`\`

## 🎯 Quick Actions
1. **Copy the prompt above** and paste into Cursor
2. **Open the repository** in Cursor: \`${context.environmentInfo?.workingDirectory || process.cwd()}\`
3. **Run diagnostic commands**:
   - \`npm run type-check\` - Check TypeScript errors
   - \`npm run test\` - Run tests
   - \`npm run lint\` - Check linting
   - \`npm run build\` - Test build process

---
*Generated by Cursor CLI Auto-Fix System (Fallback Mode - Enhanced for Interactive Debugging)*
`;

  fs.writeFileSync(CONFIG.outputFile, fallbackReport);
  console.log(`📄 Enhanced fallback analysis report saved to ${CONFIG.outputFile}`);
  console.log(`🎯 Copy-paste ready Cursor prompt included!`);
}

// Run the analysis
if (require.main === module) {
  analyzeCIFailure().catch(console.error);
}

module.exports = { analyzeCIFailure };
