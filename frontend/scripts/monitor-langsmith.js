#!/usr/bin/env node

/**
 * LangSmith Monitoring Script
 * 
 * This script can be run manually or scheduled (e.g., via cron) to monitor
 * LangSmith integration health and send alerts if issues are detected.
 * 
 * Usage:
 *   node scripts/monitor-langsmith.js
 *   node scripts/monitor-langsmith.js --alert-email=admin@example.com
 *   node scripts/monitor-langsmith.js --webhook=https://hooks.slack.com/...
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  alertEmail: process.argv.find(arg => arg.startsWith('--alert-email='))?.split('=')[1],
  webhookUrl: process.argv.find(arg => arg.startsWith('--webhook='))?.split('=')[1],
  thresholds: {
    maxFailedTests: 1,
    maxFailureRate: 0.2, // 20%
    maxResponseTime: 5000, // 5 seconds
    maxErrorRate: 0.1 // 10%
  }
};

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 10000
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
    req.end();
  });
}

/**
 * Send alert notification
 */
async function sendAlert(message, details = {}) {
  console.log(`🚨 ALERT: ${message}`);
  
  if (details.tests) {
    console.log('Test Results:');
    details.tests.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`  ${status} ${result.testName}`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });
  }

  if (details.monitoring) {
    console.log('Project Stats:');
    console.log(`  Total Runs: ${details.monitoring.projectStats.totalRuns}`);
    console.log(`  Success Rate: ${((details.monitoring.projectStats.successfulRuns / details.monitoring.projectStats.totalRuns) * 100).toFixed(1)}%`);
    console.log(`  Avg Response Time: ${details.monitoring.projectStats.averageResponseTime}ms`);
  }

  // Send webhook notification if configured
  if (CONFIG.webhookUrl) {
    try {
      const payload = {
        text: `🚨 LangSmith Alert: ${message}`,
        attachments: [{
          color: 'danger',
          fields: [
            {
              title: 'Failed Tests',
              value: details.tests?.failedTests || 0,
              short: true
            },
            {
              title: 'Success Rate',
              value: details.monitoring ? 
                `${((details.monitoring.projectStats.successfulRuns / details.monitoring.projectStats.totalRuns) * 100).toFixed(1)}%` : 
                'N/A',
              short: true
            }
          ]
        }]
      };

      await makeRequest(CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('✅ Webhook notification sent');
    } catch (error) {
      console.error('❌ Failed to send webhook notification:', error.message);
    }
  }

  // Send email notification if configured
  if (CONFIG.alertEmail) {
    // Note: In production, you'd want to use a proper email service
    console.log(`📧 Email alert would be sent to: ${CONFIG.alertEmail}`);
    console.log(`   Subject: LangSmith Integration Alert`);
    console.log(`   Body: ${message}`);
  }
}

/**
 * Check if metrics exceed thresholds
 */
function checkThresholds(health) {
  const issues = [];
  const { tests, monitoring } = health;
  const { projectStats } = monitoring;

  // Check test failures
  if (tests.failedTests > CONFIG.thresholds.maxFailedTests) {
    issues.push(`Too many failed tests: ${tests.failedTests}/${tests.totalTests}`);
  }

  // Check failure rate
  if (projectStats.totalRuns > 0) {
    const failureRate = projectStats.failedRuns / projectStats.totalRuns;
    if (failureRate > CONFIG.thresholds.maxFailureRate) {
      issues.push(`High failure rate: ${(failureRate * 100).toFixed(1)}%`);
    }
  }

  // Check response time
  if (projectStats.averageResponseTime > CONFIG.thresholds.maxResponseTime) {
    issues.push(`High response time: ${projectStats.averageResponseTime}ms`);
  }

  return issues;
}

/**
 * Main monitoring function
 */
async function monitorLangSmith() {
  console.log('🔍 Starting LangSmith monitoring...');
  console.log(`📡 Checking: ${CONFIG.baseUrl}/api/test/langsmith`);
  
  try {
    // Fetch health data
    const response = await makeRequest(`${CONFIG.baseUrl}/api/test/langsmith`);
    
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.data.error || 'Unknown error'}`);
    }

    const health = response.data;
    
    // Check thresholds
    const issues = checkThresholds(health);
    
    if (issues.length > 0) {
      const message = `LangSmith integration issues detected: ${issues.join(', ')}`;
      await sendAlert(message, health);
      process.exit(1); // Exit with error code
    } else {
      console.log('✅ LangSmith integration is healthy');
      console.log(`   Tests: ${health.tests.passedTests}/${health.tests.totalTests} passed`);
      console.log(`   Runs: ${health.monitoring.projectStats.successfulRuns}/${health.monitoring.projectStats.totalRuns} successful`);
      console.log(`   Avg Response: ${health.monitoring.projectStats.averageResponseTime}ms`);
      process.exit(0); // Exit successfully
    }
    
  } catch (error) {
    const message = `LangSmith monitoring failed: ${error.message}`;
    console.error(`❌ ${message}`);
    
    await sendAlert(message, { error: error.message });
    process.exit(1);
  }
}

// Run monitoring if this script is executed directly
if (require.main === module) {
  monitorLangSmith();
}

module.exports = { monitorLangSmith, checkThresholds, sendAlert };
