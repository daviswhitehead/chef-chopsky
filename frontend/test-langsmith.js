#!/usr/bin/env node

/**
 * Manual test script for LangSmith getRecentRuns function
 * Usage: node test-langsmith.js
 */

const { langsmithTests } = require('./lib/langsmith-tests');

async function testGetRecentRuns() {
  console.log('🧪 Testing LangSmith getRecentRuns function...\n');
  
  try {
    // Test with different limits
    console.log('📊 Testing with limit=3:');
    const runs3 = await langsmithTests.getRecentRuns(3);
    console.log(`Found ${runs3.length} runs:`);
    runs3.forEach((run, index) => {
      console.log(`  ${index + 1}. ID: ${run.id}`);
      console.log(`     Status: ${run.status}`);
      console.log(`     Start: ${run.startTime}`);
      if (run.inputs && run.inputs.messages) {
        const messages = Array.isArray(run.inputs.messages) ? run.inputs.messages : [run.inputs.messages];
        const userMessage = messages.find(msg => msg.role === 'user');
        if (userMessage) {
          console.log(`     User Message: "${userMessage.content.substring(0, 50)}..."`);
        }
      }
      console.log('');
    });
    
    console.log('📊 Testing with limit=1:');
    const runs1 = await langsmithTests.getRecentRuns(1);
    console.log(`Found ${runs1.length} runs:`);
    if (runs1.length > 0) {
      const run = runs1[0];
      console.log(`  Latest Run ID: ${run.id}`);
      console.log(`  Status: ${run.status}`);
      console.log(`  Start Time: ${run.startTime}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testGetRecentRuns();
