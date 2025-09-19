#!/usr/bin/env node

/**
 * Health check script for Chef Chopsky services
 * Ensures both frontend and agent services are running before tests
 */

const http = require('http');
const https = require('https');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const AGENT_URL = process.env.AGENT_URL || 'http://localhost:3001';
const MAX_RETRIES = 60; // 60 seconds total
const RETRY_INTERVAL = 1000; // 1 second between retries

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 5000 }, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300 });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkService(name, url, healthPath = '') {
  const fullUrl = url + healthPath;
  
  try {
    const result = await makeRequest(fullUrl);
    if (result.ok) {
      log(`✅ ${name} service is healthy (${fullUrl})`, 'green');
      return true;
    } else {
      log(`⚠️  ${name} service responded with status ${result.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ ${name} service is not responding (${fullUrl}): ${error.message}`, 'red');
    return false;
  }
}

async function waitForServices() {
  log('🔍 Checking service health...', 'cyan');
  
  let frontendReady = false;
  let agentReady = false;
  let attempts = 0;
  
  while ((!frontendReady || !agentReady) && attempts < MAX_RETRIES) {
    attempts++;
    
    log(`\n📡 Health check attempt ${attempts}/${MAX_RETRIES}`, 'blue');
    
    // Check frontend service
    if (!frontendReady) {
      frontendReady = await checkService('Frontend', FRONTEND_URL, '/');
    }
    
    // Check agent service
    if (!agentReady) {
      agentReady = await checkService('Agent', AGENT_URL, '/health');
    }
    
    if (frontendReady && agentReady) {
      log('\n🎉 All services are healthy and ready!', 'green');
      return true;
    }
    
    if (attempts < MAX_RETRIES) {
      log(`⏳ Waiting ${RETRY_INTERVAL}ms before next check...`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    }
  }
  
  log('\n❌ Services failed to become ready within timeout', 'red');
  log(`Frontend ready: ${frontendReady}`, frontendReady ? 'green' : 'red');
  log(`Agent ready: ${agentReady}`, agentReady ? 'green' : 'red');
  
  return false;
}

async function main() {
  log('🚀 Chef Chopsky Service Health Check', 'bright');
  log('=====================================', 'bright');
  
  const success = await waitForServices();
  
  if (success) {
    log('\n✅ Health check passed - services are ready for testing!', 'green');
    process.exit(0);
  } else {
    log('\n❌ Health check failed - services are not ready', 'red');
    log('\n💡 Make sure to run: npm run dev', 'yellow');
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('Chef Chopsky Service Health Check', 'bright');
  log('Usage: node scripts/health-check.js [options]', 'cyan');
  log('Options:', 'cyan');
  log('  --help, -h    Show this help message', 'cyan');
  log('  --frontend    Check only frontend service', 'cyan');
  log('  --agent       Check only agent service', 'cyan');
  log('Environment variables:', 'cyan');
  log('  FRONTEND_URL  Frontend service URL (default: http://localhost:3000)', 'cyan');
  log('  AGENT_URL     Agent service URL (default: http://localhost:3001)', 'cyan');
  process.exit(0);
}

if (process.argv.includes('--frontend')) {
  checkService('Frontend', FRONTEND_URL, '/').then(success => {
    process.exit(success ? 0 : 1);
  });
} else if (process.argv.includes('--agent')) {
  checkService('Agent', AGENT_URL, '/health').then(success => {
    process.exit(success ? 0 : 1);
  });
} else {
  main().catch(error => {
    log(`\n💥 Health check failed with error: ${error.message}`, 'red');
    process.exit(1);
  });
}
