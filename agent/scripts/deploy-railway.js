#!/usr/bin/env node

/**
 * Railway Deployment Script
 * 
 * This script leverages Railway's "config as code" approach to deploy
 * the Chef Chopsky agent service with proper configuration management.
 * 
 * Usage:
 *   node scripts/deploy-railway.js [environment]
 *   npm run deploy:railway [environment]
 * 
 * Examples:
 *   npm run deploy:railway production
 *   npm run deploy:railway staging
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkRailwayCLI() {
  try {
    execSync('railway --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkRailwayAuth() {
  try {
    execSync('railway whoami', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function validateRailwayConfig() {
  const configPath = join(projectRoot, 'railway.toml');
  if (!existsSync(configPath)) {
    throw new Error('railway.toml not found. Railway config as code requires this file.');
  }
  
  const config = readFileSync(configPath, 'utf8');
  if (!config.includes('[build]') || !config.includes('[deploy]')) {
    throw new Error('railway.toml is missing required [build] or [deploy] sections.');
  }
  
  log('✅ Railway config as code validation passed', 'green');
}

function deployToRailway(environment = 'production') {
  log(`🚀 Deploying to Railway ${environment} environment...`, 'bold');
  
  try {
    // Check if we're in the correct environment
    const statusCommand = `railway status --environment ${environment}`;
    execSync(statusCommand, { stdio: 'pipe', cwd: projectRoot });
    
    // Trigger deployment
    const deployCommand = `railway up --environment ${environment}`;
    log('🔄 Triggering Railway deployment...', 'blue');
    
    const result = execSync(deployCommand, { 
      stdio: 'inherit',
      cwd: projectRoot
    });
    
    log('✅ Deployment triggered successfully!', 'green');
    log('🔍 Check Railway dashboard for deployment status.', 'cyan');
    
  } catch (error) {
    log(`❌ Deployment failed: ${error.message}`, 'red');
    throw error;
  }
}

function showDeploymentInfo(environment) {
  log('\n📊 Deployment Information:', 'bold');
  log(`Environment: ${environment}`, 'blue');
  log('Configuration: Config as Code (railway.toml)', 'blue');
  log('Build Command: npm install && npm run build', 'blue');
  log('Start Command: node dist/src/server.js', 'blue');
  log('Health Check: /health', 'blue');
  log('Restart Policy: ON_FAILURE (max 10 retries)', 'blue');
}

function main() {
  const environment = process.argv[2] || 'production';
  
  log('🚀 Railway Config as Code Deployment', 'bold');
  log('====================================', 'bold');
  
  // Validate prerequisites
  if (!checkRailwayCLI()) {
    log('❌ Railway CLI not found. Install with: npm install -g @railwaydev/cli', 'red');
    process.exit(1);
  }
  
  if (!checkRailwayAuth()) {
    log('❌ Not authenticated with Railway. Run: railway login', 'red');
    process.exit(1);
  }
  
  // Validate Railway config as code
  try {
    validateRailwayConfig();
  } catch (error) {
    log(`❌ ${error.message}`, 'red');
    process.exit(1);
  }
  
  // Show deployment information
  showDeploymentInfo(environment);
  
  // Deploy to Railway
  try {
    deployToRailway(environment);
    
    log('\n🎉 Deployment Complete!', 'green');
    log('Next steps:', 'cyan');
    log('1. Check Railway dashboard for deployment status', 'cyan');
    log('2. Test health endpoint: curl https://your-service.up.railway.app/health', 'cyan');
    log('3. Monitor logs for any startup issues', 'cyan');
    
  } catch (error) {
    log('\n❌ Deployment failed. Check the error messages above.', 'red');
    process.exit(1);
  }
}

main();
