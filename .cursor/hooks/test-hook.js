#!/usr/bin/env node

/**
 * Test script for the Cursor environment access blocking hook
 * 
 * This script tests the hook functionality to ensure it properly
 * blocks dangerous commands while allowing safe ones.
 */

const { spawn } = require('child_process');
const path = require('path');

// Test cases for shell commands
const shellTestCases = [
  // Dangerous commands that should be blocked
  { command: 'cat .env', shouldBlock: true, description: 'Direct .env access' },
  { command: 'cat .env.local', shouldBlock: true, description: 'Local env file access' },
  { command: 'cat .env.production', shouldBlock: true, description: 'Production env file access' },
  { command: 'cat .env.staging', shouldBlock: true, description: 'Staging env file access' },
  { command: 'cat .env.development', shouldBlock: true, description: 'Development env file access' },
  { command: 'less .env', shouldBlock: true, description: 'Pager access to .env' },
  { command: 'more .env', shouldBlock: true, description: 'Pager access to .env' },
  { command: 'head .env', shouldBlock: true, description: 'Head command on .env' },
  { command: 'tail .env', shouldBlock: true, description: 'Tail command on .env' },
  { command: 'grep API_KEY .env', shouldBlock: true, description: 'Grep in .env file' },
  { command: 'find . -name ".env"', shouldBlock: true, description: 'Find .env files' },
  { command: 'ls -la .env*', shouldBlock: true, description: 'List .env files' },
  { command: 'env', shouldBlock: true, description: 'Environment variable dump' },
  { command: 'printenv', shouldBlock: true, description: 'Print environment variables' },
  { command: 'cat config/secrets.json', shouldBlock: true, description: 'Secrets config file' },
  { command: 'cat ~/.aws/credentials', shouldBlock: true, description: 'AWS credentials' },
  { command: 'cat ~/.ssh/id_rsa', shouldBlock: true, description: 'SSH private key' },
  
  // Safe commands that should be allowed
  { command: 'cat .env.example', shouldBlock: false, description: 'Safe example file' },
  { command: 'ls -la', shouldBlock: false, description: 'General directory listing' },
  { command: 'pwd', shouldBlock: false, description: 'Print working directory' },
  { command: 'echo "Hello World"', shouldBlock: false, description: 'Simple echo command' },
  { command: 'npm install', shouldBlock: false, description: 'Package installation' },
  { command: 'git status', shouldBlock: false, description: 'Git status check' },
  { command: 'node --version', shouldBlock: false, description: 'Node version check' },
  { command: 'cat package.json', shouldBlock: false, description: 'Package.json access' },
  { command: 'cat README.md', shouldBlock: false, description: 'README access' },
  { command: 'cat .gitignore', shouldBlock: false, description: 'Gitignore access' },
];

// Test cases for file reading
const fileTestCases = [
  // Dangerous files that should be blocked
  { command: '.env', shouldBlock: true, description: 'Direct .env file' },
  { command: '.env.local', shouldBlock: true, description: 'Local env file' },
  { command: '.env.production', shouldBlock: true, description: 'Production env file' },
  { command: '.env.staging', shouldBlock: true, description: 'Staging env file' },
  { command: '.env.development', shouldBlock: true, description: 'Development env file' },
  { command: 'config/secrets.json', shouldBlock: true, description: 'Secrets config file' },
  { command: '~/.aws/credentials', shouldBlock: true, description: 'AWS credentials' },
  { command: '~/.ssh/id_rsa', shouldBlock: true, description: 'SSH private key' },
  { command: 'database.sqlite', shouldBlock: true, description: 'Database file' },
  { command: 'app.key', shouldBlock: true, description: 'Private key file' },
  { command: 'cert.pem', shouldBlock: true, description: 'Certificate file' },
  
  // Safe files that should be allowed
  { command: '.env.example', shouldBlock: false, description: 'Safe example file' },
  { command: 'package.json', shouldBlock: false, description: 'Package.json file' },
  { command: 'README.md', shouldBlock: false, description: 'README file' },
  { command: '.gitignore', shouldBlock: false, description: 'Gitignore file' },
  { command: 'src/index.js', shouldBlock: false, description: 'Source code file' },
  { command: 'public/logo.png', shouldBlock: false, description: 'Public asset file' },
];

// Combine all test cases
const allTestCases = [
  ...shellTestCases.map(tc => ({ ...tc, hookType: 'beforeShellExecution' })),
  ...fileTestCases.map(tc => ({ ...tc, hookType: 'beforeReadFile' }))
];

console.log('🧪 Testing Cursor Environment Access Blocking Hook\n');

let passedTests = 0;
let failedTests = 0;

// Function to test a single command
function testCommand(testCase, index) {
  return new Promise((resolve) => {
    const { command, shouldBlock, description, hookType } = testCase;
    
    console.log(`Test ${index + 1}: ${description} (${hookType})`);
    console.log(`Command: "${command}"`);
    
    const hookPath = path.join(__dirname, 'block-env-access.js');
    const env = { ...process.env };
    if (hookType) {
      env.CURSOR_HOOK_TYPE = hookType;
    }
    
    const child = spawn('node', [hookPath, command], { 
      stdio: 'pipe',
      env: env
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code) => {
      const actualBlocked = code === 1; // Exit code 1 means blocked
      const expectedBlocked = shouldBlock;
      
      if (actualBlocked === expectedBlocked) {
        console.log(`✅ PASS: ${actualBlocked ? 'BLOCKED' : 'ALLOWED'} (expected: ${expectedBlocked ? 'BLOCKED' : 'ALLOWED'})`);
        passedTests++;
      } else {
        console.log(`❌ FAIL: ${actualBlocked ? 'BLOCKED' : 'ALLOWED'} (expected: ${expectedBlocked ? 'BLOCKED' : 'ALLOWED'})`);
        failedTests++;
      }
      
      if (actualBlocked && shouldBlock) {
        // Extract safe alternative from error output
        const safeMatch = errorOutput.match(/✅ Safe alternative: (.+)/);
        if (safeMatch) {
          console.log(`💡 Safe alternative: ${safeMatch[1]}`);
        }
      }
      
      console.log(''); // Empty line for readability
      resolve();
    });
  });
}

// Run all tests sequentially
async function runTests() {
  for (let i = 0; i < allTestCases.length; i++) {
    await testCommand(allTestCases[i], i);
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / allTestCases.length) * 100)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! The hook is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the hook implementation.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);
