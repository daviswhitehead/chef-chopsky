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
  
  // Check if Cursor CLI is available
  await checkCursorCLI();
  
  // Gather failure context
  const context = await gatherFailureContext();
  
  // Run Cursor analysis
  const analysis = await runCursorAnalysis(context);
  
  // Create analysis report
  await createAnalysisReport(context, analysis);
  
  console.log('✅ Cursor analysis complete!');
}

/**
 * Check if Cursor CLI is installed and configured
 */
async function checkCursorCLI() {
  // Check if cursor-agent command exists
  try {
    execSync('cursor-agent --version', { stdio: 'pipe' });
    console.log('✅ Cursor CLI is available');
  } catch (error) {
    throw new Error(`Cursor CLI not found. Please install it: curl -fsSL https://cursor.com/install | bash`);
  }
  
  // Check if API key is configured
  if (!process.env.CURSOR_API_KEY) {
    throw new Error('CURSOR_API_KEY environment variable is not set. Please add it to your GitHub repository secrets.');
  }
  console.log('✅ Cursor API key is configured');
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
    
    // Use cursor-agent with --print flag and file input (non-interactive mode)
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
 * Get failed GitHub checks
 */
async function getFailedChecks() {
  try {
    // Try to get check runs from GitHub API
    const result = execSync('gh api repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/check-runs --jq ".check_runs[] | select(.conclusion == \"failure\") | .name"', { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 10000
    });
    
    const failedChecks = result.trim().split('\n').filter(name => name.trim());
    if (failedChecks.length > 0) {
      return failedChecks.map(name => `- ${name}`).join('\n');
    }
    return 'No failed checks found via API';
  } catch (error) {
    // Fallback: try to get recent CI output and extract failure info
    try {
      const commands = ['npm run test', 'npm run build', 'npm run lint', 'npm run type-check'];
      const failures = [];
      
      for (const cmd of commands) {
        try {
          const output = execSync(`${cmd} 2>&1`, { 
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 10000
          });
          // If command succeeds, no failure
        } catch (cmdError) {
          const cmdName = cmd.split(' ')[2] || cmd;
          failures.push(`- ${cmdName} (failed)`);
        }
      }
      
      if (failures.length > 0) {
        return failures.join('\n');
      }
      return 'Could not retrieve failed checks or CI output';
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
async function createAnalysisReport(context, analysis) {
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

---

## 🚀 Interactive Debugging Session

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

---
*Generated by Cursor CLI Auto-Fix System - Enhanced for Interactive Debugging*
`;

  fs.writeFileSync(CONFIG.outputFile, report);
  console.log(`📄 Enhanced analysis report saved to ${CONFIG.outputFile}`);
  console.log(`🎯 Copy-paste ready Cursor prompt included!`);
}


// Run the analysis
if (require.main === module) {
  analyzeCIFailure().catch(console.error);
}

module.exports = { analyzeCIFailure };
