#!/usr/bin/env node

/**
 * Simple Railway Environment Sync
 * 
 * Reads .env.production and updates Railway environment variables
 * 
 * Usage:
 *   npm run sync:env
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Environment file not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf8');
  const variables = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      return;
    }

    // Parse KEY=VALUE format
    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) {
      return;
    }

    const key = line.substring(0, equalIndex).trim();
    const value = line.substring(equalIndex + 1).trim();

    // Remove quotes if present
    const cleanValue = value.replace(/^["']|["']$/g, '');

    variables[key] = cleanValue;
  });

  return variables;
}

function main() {
  console.log('🚀 Syncing .env.production to Railway...');

  // Check if Railway CLI is available
  try {
    const version = execSync('railway --version', { stdio: 'pipe', encoding: 'utf8' });
    console.log(`🔧 Railway CLI version: ${version.trim()}`);
  } catch (error) {
    console.error('❌ Railway CLI not found. Install with: npm install -g @railwaydev/cli');
    process.exit(1);
  }

  // Check if we're logged in
  try {
    const whoami = execSync('railway whoami', { stdio: 'pipe', encoding: 'utf8' });
    console.log(`👤 Logged in as: ${whoami.trim()}`);
  } catch (error) {
    console.error('❌ Not logged into Railway. Run: railway login');
    process.exit(1);
  }

  // Check if we're in a Railway project
  try {
    const status = execSync('railway status', { stdio: 'pipe', encoding: 'utf8', cwd: projectRoot });
    console.log(`🔗 Railway project status: ${status.trim()}`);
  } catch (error) {
    console.error('❌ Not in a Railway project. Run: railway link');
    process.exit(1);
  }

  // Parse .env.production file
  const envFilePath = join(projectRoot, '.env.production');
  
  try {
    const variables = parseEnvFile(envFilePath);
    
    if (Object.keys(variables).length === 0) {
      console.log('⚠️  No environment variables found in .env.production');
      return;
    }

    console.log(`📊 Found ${Object.keys(variables).length} variables to sync`);

    // Build a single command with all variables
    const setFlags = Object.entries(variables)
      .map(([key, value]) => `--set "${key}=${value}"`)
      .join(' ');

    const command = `railway variables ${setFlags}`;
    
    try {
      console.log('🔄 Setting all variables in one transaction...');
      const result = execSync(command, { 
        stdio: 'pipe',
        cwd: projectRoot,
        encoding: 'utf8'
      });
      
      console.log('✅ All variables set successfully!');
      console.log('🎉 Railway will deploy once with all changes.');
      
    } catch (error) {
      console.log(`❌ Failed to set variables: ${error.message}`);
      if (error.stdout) {
        console.log(`   stdout: ${error.stdout}`);
      }
      if (error.stderr) {
        console.log(`   stderr: ${error.stderr}`);
      }
      
      // Fallback: try setting variables individually if batch fails
      console.log('🔄 Falling back to individual variable setting...');
      for (const [key, value] of Object.entries(variables)) {
        try {
          const individualCommand = `railway variables --set "${key}=${value}"`;
          execSync(individualCommand, { 
            stdio: 'pipe',
            cwd: projectRoot,
            encoding: 'utf8'
          });
          console.log(`✅ ${key}`);
        } catch (individualError) {
          console.log(`❌ Failed to set ${key}: ${individualError.message}`);
        }
      }
    }

    console.log('🎉 Sync complete! Railway will redeploy automatically.');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
