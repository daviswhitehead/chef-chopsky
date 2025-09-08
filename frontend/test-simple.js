#!/usr/bin/env node

/**
 * Simple test for LangSmith monitoring endpoint
 * Usage: node test-simple.js
 */

const http = require('http');

function testLangSmithEndpoint() {
  console.log('🧪 Testing LangSmith monitoring endpoint...\n');
  
  // Test with different limits
  const limit = process.argv[2] || '3';
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/test/langsmith/monitoring?limit=${limit}`,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        
        // If --json flag is passed, output clean JSON for jq
        if (process.argv.includes('--json')) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }
        
        // Default: human-readable output
        console.log('✅ API Response received');
        console.log(`📊 Found ${result.monitoring.recentRuns.length} recent runs:`);
        
        result.monitoring.recentRuns.forEach((run, index) => {
          console.log(`\n${index + 1}. Run Details:`);
          console.log(`   ID: ${run.id}`);
          console.log(`   Status: ${run.status}`);
          console.log(`   Start Time: ${run.startTime}`);
          console.log(`   End Time: ${run.endTime || 'N/A'}`);
          
          if (run.inputs && run.inputs.messages) {
            const messages = Array.isArray(run.inputs.messages) ? run.inputs.messages : [run.inputs.messages];
            const userMessage = messages.find(msg => msg.role === 'user');
            if (userMessage) {
              console.log(`   User Message: "${userMessage.content}"`);
            }
          }
        });
        
        console.log('\n🎉 Test completed successfully!');
        
      } catch (error) {
        console.error('❌ Failed to parse JSON:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.end();
}

// Run the test
testLangSmithEndpoint();
