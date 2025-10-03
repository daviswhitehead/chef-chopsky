#!/usr/bin/env node

/**
 * Supabase Service Role Key Sync Script
 * Automatically syncs the Supabase service role key to Vercel
 */

const { execSync } = require('child_process');
const readline = require('readline');

// Configuration
const SUPABASE_PROJECT_REF = 'wlycgcwsnbhqeojjwjpo';
const VERCEL_ENVIRONMENT = 'production';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'blue');
  
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    log('✅ Vercel CLI is installed', 'green');
  } catch (error) {
    log('❌ Vercel CLI is not installed', 'red');
    log('Install it with: npm install -g vercel', 'yellow');
    process.exit(1);
  }
  
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    log('✅ Logged in to Vercel', 'green');
  } catch (error) {
    log('❌ Not logged in to Vercel', 'red');
    log('Please run: vercel login', 'yellow');
    process.exit(1);
  }
}

function getSecretKey() {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    log('🔑 Getting Supabase secret key...', 'blue');
    log('📋 Please get your Supabase secret key:', 'yellow');
    log(`1. Go to: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/settings/api`, 'yellow');
    log('2. Scroll down to \'Secret keys\' section', 'yellow');
    log('3. Click \'Generate new secret key\' if you don\'t have one', 'yellow');
    log('4. Copy the secret key (starts with \'sb_secret_...\')', 'yellow');
    log('5. Paste it below:', 'yellow');
    
    rl.question('Secret Key: ', (key) => {
      rl.close();
      
      if (!key.trim()) {
        log('❌ No secret key provided', 'red');
        reject(new Error('No secret key provided'));
        return;
      }
      
      // Validate key format
      if (!key.trim().startsWith('sb_secret_')) {
        log('❌ Invalid secret key format', 'red');
        log('Secret key should start with \'sb_secret_...\'', 'yellow');
        reject(new Error('Invalid secret key format'));
        return;
      }
      
      log('✅ Secret key validated', 'green');
      resolve(key.trim());
    });
  });
}

function syncSecretKey(secretKey) {
  log('🔄 Syncing secret key to Vercel...', 'blue');
  
  try {
    // Check if variable already exists
    const envList = execSync('vercel env ls', { encoding: 'utf8' });
    if (envList.includes('SUPABASE_SECRET_KEY')) {
      log('⚠️  SUPABASE_SECRET_KEY already exists, updating...', 'yellow');
      execSync(`vercel env rm SUPABASE_SECRET_KEY ${VERCEL_ENVIRONMENT} --yes`, { stdio: 'pipe' });
    }
    
    // Add the variable
    execSync(`echo "${secretKey}" | vercel env add SUPABASE_SECRET_KEY ${VERCEL_ENVIRONMENT}`, { stdio: 'pipe' });
    log('✅ Secret key synced successfully', 'green');
    
  } catch (error) {
    log('❌ Failed to sync secret key', 'red');
    log(`Error: ${error.message}`, 'red');
    throw error;
  }
}

function verifyEnvironment() {
  log('🔍 Verifying environment setup...', 'blue');
  
  try {
    const envList = execSync('vercel env ls', { encoding: 'utf8' });
    log('📋 Current Vercel environment variables:', 'blue');
    console.log(envList);
    
    // Test Supabase connection
    log('🔗 Testing Supabase connection...', 'blue');
    const testUrl = `https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/conversations`;
    const testKey = 'sb_publishable_5Z33oH3ZdsxtVuGGWSwbig_JXW7IXT6';
    
    try {
      const response = execSync(`curl -s -H "apikey: ${testKey}" -H "Authorization: Bearer ${testKey}" "${testUrl}"`, { encoding: 'utf8' });
      if (response.includes('id')) {
        log('✅ Supabase connection successful', 'green');
      } else {
        log('❌ Supabase connection failed', 'red');
        return false;
      }
    } catch (error) {
      log('❌ Supabase connection test failed', 'red');
      return false;
    }
    
    // Test agent connection
    log('🤖 Testing agent connection...', 'blue');
    try {
      const response = execSync('curl -s "https://chef-chopsky-production.up.railway.app/health"', { encoding: 'utf8' });
      if (response.includes('ok')) {
        log('✅ Agent connection successful', 'green');
      } else {
        log('❌ Agent connection failed', 'red');
        return false;
      }
    } catch (error) {
      log('❌ Agent connection test failed', 'red');
      return false;
    }
    
    return true;
    
  } catch (error) {
    log('❌ Environment verification failed', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function redeployFrontend() {
  log('🚀 Redeploying frontend with new environment variables...', 'blue');
  
  try {
    process.chdir('frontend');
    execSync('vercel --prod --yes', { stdio: 'pipe' });
    process.chdir('..');
    log('✅ Frontend redeployed successfully', 'green');
  } catch (error) {
    log('❌ Frontend redeployment failed', 'red');
    log(`Error: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  try {
    log('🚀 Starting Supabase service role key sync...', 'blue');
    
    // Step 1: Check prerequisites
    checkPrerequisites();
    
    // Step 2: Get secret key
    const secretKey = await getSecretKey();
    
    // Step 3: Sync secret key
    syncSecretKey(secretKey);
    
    // Step 4: Verify environment
    const isVerified = verifyEnvironment();
    if (!isVerified) {
      log('❌ Environment verification failed', 'red');
      process.exit(1);
    }
    
    // Step 5: Redeploy frontend
    redeployFrontend();
    
    log('', 'reset');
    log('🎉 Secret key sync completed successfully!', 'green');
    log('', 'reset');
    log('📋 Summary:', 'blue');
    log('✅ Secret key synced to Vercel', 'green');
    log('✅ Supabase connection verified', 'green');
    log('✅ Agent connection verified', 'green');
    log('✅ Frontend redeployed', 'green');
    log('', 'reset');
    log('🌐 Your production application is ready:', 'blue');
    log('   Frontend: https://chef-chopsky-production.vercel.app', 'green');
    log('   Agent: https://chef-chopsky-production.up.railway.app', 'green');
    
  } catch (error) {
    log('❌ Sync failed', 'red');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  getSecretKey,
  syncSecretKey,
  verifyEnvironment,
  redeployFrontend
};
