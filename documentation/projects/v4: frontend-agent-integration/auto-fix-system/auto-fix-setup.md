# Auto-Fix Setup Documentation

## Overview

This document describes the setup and usage of the automated CI failure resolution system.

## Components

### 1. GitHub Actions Workflow
- **File**: `.github/workflows/auto-fix-ci.yml`
- **Trigger**: Runs when CI or PR Validation workflows fail
- **Function**: Analyzes failures and creates fix branches with PR comments

### 2. Test Script
- **File**: `scripts/test-auto-fix.sh`
- **Purpose**: Creates intentional CI failures for testing the auto-fix system
- **Usage**: Run locally to create test failures

## Setup Instructions

### 1. GitHub Secrets
Add the following secrets to your GitHub repository:

- `OPENAI_API_KEY`: Your OpenAI API key for AI analysis
- `CURSOR_API_KEY`: Your Cursor API key (when available)

### 2. Workflow Permissions
The workflow requires the following permissions:
- `contents: write` - To create and push fix branches
- `pull-requests: write` - To post PR comments
- `actions: read` - To read workflow run information

### 3. Testing the System

#### Create Test Failures
```bash
# Run the test script to create intentional failures
./scripts/test-auto-fix.sh

# This will:
# 1. Create a test branch
# 2. Add ESLint, TypeScript, and test failures
# 3. Commit the failures
# 4. Provide instructions for next steps
```

#### Manual Testing Steps
1. Push the test branch: `git push origin <test-branch-name>`
2. Create a PR from the test branch
3. Wait for CI to fail
4. Check if the auto-fix workflow triggers
5. Review the fix branch and PR comment

## How It Works

### 1. Failure Detection
- Monitors `workflow_run` events for CI and PR Validation workflows
- Only triggers when workflow conclusion is "failure"

### 2. Context Extraction
- Extracts workflow run ID, URL, and branch information
- Identifies the associated PR number
- Gathers failure context

### 3. Fix Branch Management
- Creates fix branch: `ci-fix-{pr-number}`
- Updates existing fix branch if it already exists
- Handles branch conflicts gracefully

### 4. Analysis and Fixes
- Runs basic analysis script (placeholder for Cursor AI)
- Applies common fixes:
  - ESLint checks
  - Test runs
  - Build validation
- Commits changes if any files were modified

### 5. PR Communication
- Posts PR comment with fix explanation
- Includes quick-create PR link
- Provides analysis details

## Current Limitations (MVP)

### What Works
- ✅ CI failure detection
- ✅ Fix branch creation and management
- ✅ Basic analysis and fix application
- ✅ PR comment posting
- ✅ Quick-create PR links

### What's Missing (Future Iterations)
- ❌ Advanced AI analysis (Cursor CLI integration)
- ❌ Sophisticated fix generation
- ❌ Complex failure type handling
- ❌ Iterative fix attempts
- ❌ Learning from previous fixes

## Troubleshooting

### Common Issues

1. **Workflow doesn't trigger**
   - Check that the workflow file is in `.github/workflows/`
   - Verify the workflow names match exactly
   - Ensure the workflow has proper permissions

2. **Fix branch creation fails**
   - Check GitHub token permissions
   - Verify branch doesn't already exist with conflicts
   - Review git configuration

3. **PR comment fails**
   - Verify GitHub CLI is authenticated
   - Check PR number extraction
   - Review comment length limits

### Debugging

Enable debug logging by adding this to the workflow:
```yaml
- name: Debug
  run: |
    echo "Workflow Run ID: ${{ github.event.workflow_run.id }}"
    echo "Head Branch: ${{ github.event.workflow_run.head_branch }}"
    echo "Conclusion: ${{ github.event.workflow_run.conclusion }}"
```

## Future Enhancements

### Phase 2: AI Integration
- Integrate Cursor CLI for advanced analysis
- Implement sophisticated fix generation
- Add support for complex failure types

### Phase 3: Learning System
- Track fix success rates
- Learn from previous attempts
- Improve analysis accuracy over time

### Phase 4: Advanced Features
- Iterative fix attempts
- Team configuration options
- Detailed metrics and reporting

## Security Considerations

- All fixes require human review before merging
- No destructive changes are made automatically
- Comprehensive logging for audit trails
- Easy rollback if issues arise

## Support

For issues or questions:
1. Check the workflow logs in GitHub Actions
2. Review the PR comments for error details
3. Test with the provided test script
4. Check GitHub repository permissions and secrets
