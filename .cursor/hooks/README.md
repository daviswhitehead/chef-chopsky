# Cursor Hooks: Environment Access Security

This directory contains Cursor hooks that implement security measures to prevent the Agent from accessing sensitive environment files.

## Overview

The `block-env-access.js` hook prevents the Cursor Agent from executing dangerous commands that could expose API keys, passwords, tokens, and other sensitive information.

## Files

- `block-env-access.js` - Main hook implementation
- `config.json` - Hook configuration
- `test-hook.js` - Test suite for the hook
- `README.md` - This documentation

## How It Works

### Blocked Commands

The hook system blocks both shell commands and direct file reading that could expose sensitive information:

### Shell Command Blocking (`beforeShellExecution`)
Blocks dangerous shell commands:

#### Environment Files
- `cat .env` (but allows `cat .env.example`)
- `cat .env.local`, `cat .env.production`, `cat .env.staging`, etc.
- `less .env`, `more .env`, `head .env`, `tail .env`
- `grep API_KEY .env`
- `find . -name ".env"`
- `ls -la .env*`

#### Environment Variable Dumping
- `env`
- `printenv`
- `set`

#### Configuration Files
- `cat config/secrets.json`
- `cat ~/.aws/credentials`
- `cat ~/.ssh/id_rsa`
- `cat *.key`, `cat *.pem`, `cat *.p12`

### File Reading Blocking (`beforeReadFile`)
Blocks direct file access using Cursor's read_file tool:

#### Environment Files
- `.env` (but allows `.env.example`)
- `.env.local`, `.env.production`, `.env.staging`, etc.

#### Configuration Files
- `config/secrets.json`
- `~/.aws/credentials`
- `~/.ssh/id_rsa`
- `*.key`, `*.pem`, `*.p12`
- `database.sqlite`, `*.db`

### Allowed Commands and Files

The hooks allow safe operations:
- **Shell**: `cat .env.example`, `cat package.json`, `ls -la`, `npm install`, etc.
- **Files**: `.env.example`, `package.json`, `README.md`, `src/index.js`, etc.

## Installation

1. **Hooks are already installed** in `.cursor/hooks/`
2. **Make sure hooks are enabled** in Cursor settings
3. **Test the installation** by running the test suite:

```bash
cd .cursor/hooks
node test-hook.js
```

## Configuration

The hook configuration is in `.cursor/hooks.json`:

```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      {
        "command": "hooks/block-env-access.js"
      }
    ],
    "beforeReadFile": [
      {
        "command": "hooks/block-env-access.js"
      }
    ]
  }
}
```

## Testing

Run the test suite to verify the hook works correctly:

```bash
cd .cursor/hooks
node test-hook.js
```

Expected output: `🎉 All tests passed! The hook is working correctly.`

## How to Use

### When You Need Environment Information

Instead of running `cat .env`, use these safe alternatives:

1. **Use .env.example files**:
   ```bash
   cat .env.example  # ✅ Safe - contains no secrets
   ```

2. **Ask the user directly**:
   ```
   "What is your OPENAI_API_KEY value?"
   ```

3. **Reference environment variable names**:
   ```
   "Based on .env.example, you need to set OPENAI_API_KEY"
   ```

### When the Hook Blocks a Command

If you try to run a dangerous command, you'll see:

```
🚨 SECURITY BLOCK: Environment file access blocked
❌ Blocked command: cat .env
✅ Safe alternative: cat .env.example (safe - contains no secrets)

🔒 Why this is blocked:
   - Environment files contain API keys, passwords, and tokens
   - These secrets could be exposed in conversation logs
   - This protects your application and user data

🛡️ Security best practices:
   - Use .env.example files for reference (safe)
   - Ask the user directly for specific values when needed
   - Never access actual .env files with secrets
```

## Security Benefits

1. **Prevents Secret Exposure**: Blocks commands that could expose API keys, passwords, and tokens
2. **Protects Conversation Logs**: Ensures sensitive data doesn't end up in Cursor's conversation history
3. **Enforces Best Practices**: Guides users toward safe alternatives
4. **Audit Trail**: Logs all blocked commands for security monitoring

## Customization

### Adding New Blocked Patterns

Edit `block-env-access.js` and add patterns to `DANGEROUS_PATTERNS`:

```javascript
const DANGEROUS_PATTERNS = [
  // Your existing patterns...
  /cat\s+.*\.secret/,  // Block any .secret files
  /cat\s+.*\.key/,      // Block any .key files
];
```

### Adding Safe Alternatives

Add entries to `SAFE_ALTERNATIVES`:

```javascript
const SAFE_ALTERNATIVES = {
  'cat .env': 'cat .env.example (safe - contains no secrets)',
  'cat config.secret': 'cat config.example (safe - contains no secrets)',
};
```

## Troubleshooting

### Hook Not Working

1. **Check if hooks are enabled** in Cursor settings
2. **Verify file permissions**: `chmod +x block-env-access.js`
3. **Check the configuration** in `config.json`
4. **Run the test suite** to verify functionality

### False Positives

If a safe command is being blocked:

1. **Check the regex patterns** in `DANGEROUS_PATTERNS`
2. **Add exceptions** using negative lookahead: `(?!\.example)`
3. **Test the updated patterns** with the test suite

### False Negatives

If a dangerous command is not being blocked:

1. **Add the pattern** to `DANGEROUS_PATTERNS`
2. **Test the new pattern** with the test suite
3. **Update documentation** if needed

## References

- [Cursor Hooks Beta Documentation](https://cursor.com/changelog#hooks-beta)
- [GitButler Cursor Hooks Deep Dive](https://blog.gitbutler.com/cursor-hooks-deep-dive#beforeshellexecution)
- [Project Security Rules](../rules/000-critical-security.mdc)

## Support

If you encounter issues with the hook:

1. **Check the test suite** output for specific failures
2. **Review the configuration** in `config.json`
3. **Check Cursor's hook documentation** for updates
4. **Create an issue** in the project repository

---

**Remember**: This hook is designed to protect your sensitive information. If it's blocking something you need, find a safe alternative rather than disabling the security measures.
