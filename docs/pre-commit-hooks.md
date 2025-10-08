# Pre-Commit Hooks

## Overview

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to automatically run linting checks before commits. This ensures that code quality issues are caught early, before they're pushed to the remote repository.

## How It Works

When you attempt to commit code, the pre-commit hook will:

1. **Identify staged files**: Only files that have been staged for commit are checked
2. **Run ESLint**: ESLint runs on staged JavaScript and TypeScript files
3. **Auto-fix issues**: ESLint will attempt to automatically fix any issues it can
4. **Block commit on errors**: If there are linting errors that can't be auto-fixed, the commit will be blocked

## What Gets Checked

The pre-commit hook checks:

- **Frontend files**: All `.js`, `.jsx`, `.ts`, `.tsx` files in the `frontend/` directory
- **Agent files**: All `.js`, `.ts` files in the `agent/src/` directory

## Setup

### Automatic Setup (Recommended)

Pre-commit hooks are automatically installed when you run:

```bash
npm install
```

This is because the `prepare` script in `package.json` automatically runs `husky` after installation.

### Manual Setup

If you need to manually set up the hooks:

```bash
npx husky
```

## Usage

### Normal Workflow

Just commit as usual:

```bash
git add .
git commit -m "feat: add new feature"
```

If there are any linting issues, you'll see:

```
✖ eslint --fix:
  /path/to/file.ts
    139:7  error  Unexpected lexical declaration in case block  no-case-declarations
```

The commit will be blocked until you fix the issues.

### Bypass Pre-Commit Hooks (Not Recommended)

In rare cases where you need to bypass the pre-commit hooks:

```bash
git commit --no-verify -m "your message"
```

⚠️ **Warning**: Only use this in emergencies! It defeats the purpose of the pre-commit hooks and can lead to CI failures.

## Configuration

### lint-staged Configuration

The lint-staged configuration is in `package.json`:

```json
{
  "lint-staged": {
    "frontend/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix"
    ],
    "agent/src/**/*.{js,ts}": [
      "eslint --fix"
    ]
  }
}
```

### Pre-Commit Hook Script

The pre-commit hook script is in `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged to check staged files
npx lint-staged
```

## Benefits

1. **Catch errors early**: Find and fix linting issues before pushing to remote
2. **Consistent code quality**: Ensure all commits meet the project's code quality standards
3. **Faster CI**: Reduce CI failures by catching issues locally
4. **Auto-fixing**: Many linting issues are automatically fixed
5. **Fast feedback**: Only checks staged files, so it's quick

## Troubleshooting

### Hook not running

If the pre-commit hook isn't running:

1. Make sure Husky is installed:
   ```bash
   npm install
   ```

2. Verify the hook is executable:
   ```bash
   ls -la .husky/pre-commit
   ```

3. Reinstall Husky:
   ```bash
   npm uninstall husky && npm install --save-dev husky
   npx husky
   ```

### Linting errors

If you're getting linting errors:

1. **Run linting manually** to see the full output:
   ```bash
   npm run lint
   ```

2. **Fix issues automatically** where possible:
   ```bash
   cd frontend && npx eslint --fix .
   cd agent && npx eslint --fix src
   ```

3. **Fix remaining issues manually** based on the error messages

### Performance issues

If the pre-commit hook is slow:

1. Only stage the files you want to commit (avoid `git add .` for large changesets)
2. The hook only checks staged files, so committing smaller chunks will be faster
3. Consider increasing system resources if linting is consistently slow

## Related Documentation

- [GitHub Actions CI Workflow](./.github/workflows/ci.yml)
- [ESLint Configuration (Frontend)](../frontend/.eslintrc.json)
- [ESLint Configuration (Agent)](../agent/.eslintrc.cjs)
- [Automated Testing Guide](./testing/README.md)

## Best Practices

1. **Commit often**: Smaller commits = faster pre-commit checks
2. **Stage only what you need**: Don't stage files you're not ready to commit
3. **Fix issues locally**: Don't bypass the hooks unless absolutely necessary
4. **Keep ESLint rules up to date**: Review and update ESLint rules regularly
5. **Report false positives**: If a rule is causing issues, discuss with the team

## Additional Checks (Future Enhancements)

Consider adding these checks in the future:

- [ ] **TypeScript type checking**: Run `tsc --noEmit` on staged files
- [ ] **Unit tests**: Run tests for changed files
- [ ] **Prettier formatting**: Auto-format code on commit
- [ ] **Commit message linting**: Enforce conventional commit format
- [ ] **File size limits**: Warn about large files being committed
- [ ] **Secret detection**: Scan for accidentally committed secrets

---

*This documentation was created to help developers understand and use the pre-commit hooks effectively.*

