#!/usr/bin/env node

/**
 * Product Test Script
 * 
 * This script runs a complete product test:
 * 1. Creates a new conversation
 * 2. Sends a test message
 * 3. Validates LangSmith tracing
 * 
 * Usage:
 *   node scripts/test-product.js
 *   node scripts/test-product.js --verbose
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  verbose: process.argv.includes('--verbose')
};

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 30000 // 30 second timeout for AI responses
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * Run the product test
 */
async function runProductTest() {
  console.log('🧪 Starting Product Test...');
  console.log(`📡 Testing against: ${CONFIG.baseUrl}`);
  console.log('');

  try {
    // Run the test via the API endpoint
    const response = await makeRequest(`${CONFIG.baseUrl}/api/test/product`);
    
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.data.error || 'Unknown error'}`);
    }

    const result = response.data;
    
    if (result.success) {
      console.log('🎉 Product test PASSED!');
      console.log('');
      console.log('📊 Test Results:');
      console.log(`   Conversation ID: ${result.conversationId}`);
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   LangSmith Run ID: ${result.langsmithRunId}`);
      console.log(`   Timestamp: ${result.timestamp}`);
      
      if (CONFIG.verbose && result.details) {
        console.log('');
        console.log('🔍 Detailed Results:');
        console.log('   Conversation:', JSON.stringify(result.details.conversation, null, 2));
        console.log('   Message:', JSON.stringify(result.details.message, null, 2));
        console.log('   LangSmith:', JSON.stringify(result.details.langsmith, null, 2));
      }
      
      process.exit(0); // Success
    } else {
      console.log('💥 Product test FAILED!');
      console.log('');
      console.log('❌ Error:', result.error);
      console.log(`   Timestamp: ${result.timestamp}`);
      
      if (result.conversationId) {
        console.log(`   Conversation ID: ${result.conversationId}`);
      }
      
      if (CONFIG.verbose && result.details) {
        console.log('');
        console.log('🔍 Debug Details:');
        console.log(JSON.stringify(result.details, null, 2));
      }
      
      process.exit(1); // Failure
    }
    
  } catch (error) {
    console.log('💥 Product test FAILED with error:');
    console.log(`   ${error.message}`);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure your Next.js app is running on', CONFIG.baseUrl);
    console.log('   2. Check that LangSmith environment variables are set');
    console.log('   3. Verify your OpenAI API key is configured');
    console.log('   4. Try running with --verbose for more details');
    
    process.exit(1);
  }
}

/**
 * Get recent LangSmith runs for debugging
 */
async function getRecentRuns() {
  console.log('🔍 Getting recent LangSmith runs...');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/test/product`, {
      method: 'POST',
      body: { action: 'recent-runs' }
    });
    
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.data.error || 'Unknown error'}`);
    }

    const result = response.data;
    
    if (result.success) {
      console.log(`📊 Found ${result.recentRuns.length} recent runs:`);
      console.log('');
      
      result.recentRuns.forEach((run, index) => {
        console.log(`${index + 1}. ${run.id}`);
        console.log(`   Status: ${run.status}`);
        console.log(`   Name: ${run.name}`);
        console.log(`   Start: ${run.startTime}`);
        if (run.endTime) {
          console.log(`   End: ${run.endTime}`);
        }
        if (run.sessionId) {
          console.log(`   Session: ${run.sessionId}`);
        }
        console.log('');
      });
    } else {
      console.log('❌ Failed to get recent runs:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Error getting recent runs:', error.message);
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'recent-runs') {
    getRecentRuns();
  } else {
    runProductTest();
  }
}

module.exports = { runProductTest, getRecentRuns };
