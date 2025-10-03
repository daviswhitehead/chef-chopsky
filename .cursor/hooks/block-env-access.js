#!/usr/bin/env node

/**
 * Cursor Hook: Block Environment File Access
 * 
 * This hook prevents the Cursor Agent from accessing environment files
 * that contain sensitive information like API keys, passwords, and tokens.
 * 
 * Based on Cursor's hooks beta feature and security best practices.
 * 
 * @see https://cursor.com/changelog#hooks-beta
 * @see https://blog.gitbutler.com/cursor-hooks-deep-dive#beforeshellexecution
 * 
 * Usage: This script is called by Cursor with command line arguments
 * Exit code 0: Allow command to proceed
 * Exit code 1: Block command from executing
 */

// Parse command line arguments
const args = process.argv.slice(2);
const command = args.join(' ');

// Determine the hook context based on environment variables or arguments
// Cursor sets different environment variables for different hook types
const hookType = process.env.CURSOR_HOOK_TYPE || 'beforeShellExecution';

// If no command provided, allow execution (fallback)
if (!command) {
  process.exit(0);
}

// Dangerous patterns for shell commands
const DANGEROUS_SHELL_PATTERNS = [
  // Direct environment file access (but allow .env.example)
  /cat\s+\.env(?!\.example)/,
  /cat\s+\.env\.(?!example)/,
  /cat\s+\.env\w+(?!\.example)/,
  /less\s+\.env(?!\.example)/,
  /more\s+\.env(?!\.example)/,
  /head\s+\.env(?!\.example)/,
  /tail\s+\.env(?!\.example)/,
  /grep\s+.*\.env(?!\.example)/,
  /find\s+.*\.env(?!\.example)/,
  /ls\s+.*\.env(?!\.example)/,
  
  // Environment variable dumping
  /env\s*$/,
  /printenv/,
  /set\s*$/,
  
  // Configuration files that might contain secrets
  /cat\s+.*config.*\.json/,
  /cat\s+.*secrets/,
  /cat\s+.*credentials/,
  /cat\s+.*\.key/,
  /cat\s+.*\.pem/,
  /cat\s+.*\.p12/,
  
  // Database connection strings
  /cat\s+.*database/,
  /cat\s+.*\.db/,
  /cat\s+.*\.sqlite/,
  
  // Docker secrets
  /cat\s+.*docker/,
  /cat\s+.*compose/,
  
  // Kubernetes secrets
  /cat\s+.*kube/,
  /cat\s+.*secret/,
  
  // AWS/GCP credentials
  /cat\s+.*aws/,
  /cat\s+.*gcp/,
  /cat\s+.*\.credentials/,
  
  // SSH keys
  /cat\s+.*\.ssh/,
  /cat\s+.*id_rsa/,
  /cat\s+.*id_ed25519/,
];

// Dangerous patterns for file paths
const DANGEROUS_FILE_PATTERNS = [
  // Environment files (but allow .env.example)
  /\.env(?!\.example)$/,
  /\.env\.(?!example)/,
  /\.env\w+(?!\.example)/,
  
  // Configuration files that might contain secrets
  /.*config.*secrets.*\.json$/,
  /.*secrets.*\.json$/,
  /.*credentials.*\.json$/,
  /.*\.key$/,
  /.*\.pem$/,
  /.*\.p12$/,
  
  // Database files
  /.*\.db$/,
  /.*\.sqlite$/,
  
  // Docker files
  /.*docker.*secrets.*$/,
  /.*compose.*secrets.*$/,
  
  // Kubernetes secrets
  /.*kube.*secret.*$/,
  /.*secret.*\.yaml$/,
  /.*secret.*\.yml$/,
  
  // AWS/GCP credentials
  /.*aws.*credentials.*$/,
  /.*gcp.*credentials.*$/,
  /.*\.credentials$/,
  
  // SSH keys
  /.*\.ssh\/id_rsa$/,
  /.*\.ssh\/id_ed25519$/,
  /.*\.ssh\/id_dsa$/,
];

// Commands that are safe alternatives
const SAFE_ALTERNATIVES = {
  'cat .env': 'cat .env.example (safe - contains no secrets)',
  'cat .env.local': 'cat .env.example (safe - contains no secrets)',
  'cat .env.production': 'cat .env.example (safe - contains no secrets)',
  'cat .env.staging': 'cat .env.example (safe - contains no secrets)',
  'cat .env.development': 'cat .env.example (safe - contains no secrets)',
  'env': 'echo "Use .env.example to see environment variable names"',
  'printenv': 'echo "Use .env.example to see environment variable names"',
};

/**
 * Check if a command or file path is dangerous
 */
function isDangerousCommand(command) {
  const normalizedCommand = command.toLowerCase().trim();
  
  if (hookType === 'beforeReadFile') {
    // For file reading, check against file path patterns
    return DANGEROUS_FILE_PATTERNS.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(normalizedCommand);
      }
      return normalizedCommand.includes(pattern);
    });
  } else {
    // For shell execution, check against shell command patterns
    return DANGEROUS_SHELL_PATTERNS.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(normalizedCommand);
      }
      return normalizedCommand.includes(pattern);
    });
  }
}

/**
 * Get a safe alternative for a dangerous command
 */
function getSafeAlternative(command) {
  const normalizedCommand = command.toLowerCase().trim();
  
  for (const [dangerous, safe] of Object.entries(SAFE_ALTERNATIVES)) {
    if (normalizedCommand.includes(dangerous)) {
      return safe;
    }
  }
  
  return 'Use .env.example to see environment variable names without exposing secrets';
}

/**
 * Main hook function - called by Cursor before shell execution
 * This function checks if a command is dangerous and blocks it if necessary
 */
function checkCommand(command) {
  // Check if the command is dangerous
  if (isDangerousCommand(command)) {
    const safeAlternative = getSafeAlternative(command);
    
    if (hookType === 'beforeReadFile') {
      console.error('🚨 SECURITY BLOCK: Environment file reading blocked');
      console.error(`❌ Blocked file: ${command}`);
      console.error(`✅ Safe alternative: ${safeAlternative}`);
    } else {
      console.error('🚨 SECURITY BLOCK: Environment file access blocked');
      console.error(`❌ Blocked command: ${command}`);
      console.error(`✅ Safe alternative: ${safeAlternative}`);
    }
    
    console.error('');
    console.error('🔒 Why this is blocked:');
    console.error('   - Environment files contain API keys, passwords, and tokens');
    console.error('   - These secrets could be exposed in conversation logs');
    console.error('   - This protects your application and user data');
    console.error('');
    console.error('🛡️ Security best practices:');
    console.error('   - Use .env.example files for reference (safe)');
    console.error('   - Ask the user directly for specific values when needed');
    console.error('   - Never access actual .env files with secrets');
    
    // Exit with code 1 to block the command
    process.exit(1);
  }
  
  // Command is safe, allow it to proceed (exit with code 0)
  process.exit(0);
}

// Export utility functions for testing
module.exports = {
  isDangerousCommand,
  getSafeAlternative,
  checkCommand,
  DANGEROUS_SHELL_PATTERNS,
  DANGEROUS_FILE_PATTERNS,
  SAFE_ALTERNATIVES
};

// Main execution - only run when called directly (not imported)
if (require.main === module) {
  checkCommand(command);
}
