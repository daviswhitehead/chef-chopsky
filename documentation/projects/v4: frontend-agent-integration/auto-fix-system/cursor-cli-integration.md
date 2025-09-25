# Cursor CLI Integration Guide

## Overview

This document outlines the integration of Cursor CLI into our automated CI failure resolution system. The integration replaces the placeholder analysis with real AI-powered failure analysis and fix generation.

## Architecture

### Components

1. **Cursor CLI Installation**: Automated installation in GitHub Actions
2. **Analysis Script**: `scripts/cursor-analysis.js` - Main analysis engine
3. **Setup Script**: `scripts/setup-cursor-cli.sh` - Configuration helper
4. **Workflow Integration**: Updated `.github/workflows/auto-fix-ci.yml`

### Data Flow

```
CI Failure → GitHub Actions → Cursor CLI → AI Analysis → Fix Recommendations → PR Comment
```

## Implementation Details

### 1. Cursor CLI Installation

The workflow automatically installs Cursor CLI using the official installation script:

```bash
curl -fsSL https://cursor.com/install | bash
echo "$HOME/.cursor/bin" >> $GITHUB_PATH
```

### 2. Analysis Script (`scripts/cursor-analysis.js`)

**Key Features:**
- **Context Gathering**: Collects CI failure context, repository structure, and recent logs
- **AI Analysis**: Uses Cursor CLI to analyze failures with specialized prompts
- **Recommendation Generation**: Parses AI output into actionable fix recommendations
- **Fallback Handling**: Provides fallback recommendations when Cursor CLI fails
- **Report Generation**: Creates detailed analysis reports

**Environment Variables:**
- `CURSOR_API_KEY`: Authentication for Cursor CLI
- `WORKFLOW_RUN_URL`: Link to the failed CI workflow
- `PR_NUMBER`: Associated pull request number
- `FIX_BRANCH`: Name of the fix branch
- `HEAD_BRANCH`: Source branch name
- `GITHUB_REPOSITORY`: Repository identifier

### 3. Analysis Prompt

The script creates a comprehensive prompt for Cursor CLI that includes:

- **Context**: Repository, PR, branch information
- **Repository Structure**: File structure and codebase overview
- **CI Logs**: Recent failure logs and error messages
- **Focus Areas**: Common CI failure types (ESLint, TypeScript, tests, etc.)

### 4. Fix Recommendations

The system generates structured recommendations including:

- **Root Cause Analysis**: Detailed explanation of the failure
- **Specific Fixes**: Code changes needed to resolve the issue
- **Step-by-Step Instructions**: Implementation guidance
- **Risk Assessment**: Potential issues and considerations
- **Testing Recommendations**: Validation steps

## Configuration

### GitHub Repository Secrets

Add the following secret to your GitHub repository:

```
CURSOR_API_KEY: your_cursor_api_key_here
```

### Environment Variables

The workflow automatically sets these environment variables:

```yaml
env:
  CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
  WORKFLOW_RUN_URL: ${{ steps.context.outputs.WORKFLOW_RUN_URL }}
  PR_NUMBER: ${{ steps.pr-info.outputs.PR_NUMBER }}
  FIX_BRANCH: ${{ steps.fix-branch.outputs.FIX_BRANCH }}
  HEAD_BRANCH: ${{ steps.context.outputs.HEAD_BRANCH }}
  GITHUB_REPOSITORY: ${{ github.repository }}
```

## Usage

### Automatic Triggering

The system automatically triggers when:
1. A CI workflow completes with failure status
2. The workflow is monitored by the auto-fix system
3. A PR exists for the failed branch

### Manual Testing

To test the integration manually:

```bash
# Set up environment variables
export CURSOR_API_KEY="your_api_key"
export WORKFLOW_RUN_URL="https://github.com/user/repo/actions/runs/123"
export PR_NUMBER="456"
export FIX_BRANCH="ci-fix-456"
export HEAD_BRANCH="feature-branch"
export GITHUB_REPOSITORY="user/repo"

# Run analysis
node scripts/cursor-analysis.js
```

## Output

### Analysis Report

The system generates `AUTO_FIX_ANALYSIS.md` with:

- **CI Failure Context**: All relevant information about the failure
- **Cursor AI Analysis**: Detailed analysis from Cursor CLI
- **Fix Recommendations**: Structured recommendations with code examples
- **Next Steps**: Implementation guidance

### PR Comments

The workflow posts PR comments with:

- **Analysis Summary**: Key findings from the analysis
- **Fix Branch**: Link to the fix branch with changes
- **Quick-Create PR**: Direct link to create PR from fix branch
- **Status Information**: Success/failure status and metrics

## Error Handling

### Fallback Mode

When Cursor CLI fails, the system:

1. **Logs the Error**: Detailed error information
2. **Provides Fallback**: Common fix recommendations
3. **Continues Workflow**: Doesn't break the entire process
4. **Reports Status**: Clear indication of fallback mode

### Common Issues

**Cursor CLI Not Found:**
- Ensure installation script runs successfully
- Check PATH configuration
- Verify GitHub Actions environment

**API Key Issues:**
- Verify `CURSOR_API_KEY` secret is set
- Check API key validity
- Ensure proper permissions

**Analysis Failures:**
- Review Cursor CLI logs
- Check prompt formatting
- Verify repository access

## Monitoring

### Success Metrics

- **Analysis Success Rate**: Percentage of successful Cursor CLI analyses
- **Fix Accuracy**: Quality of generated recommendations
- **Time to Analysis**: Speed of failure analysis
- **Developer Satisfaction**: Feedback on fix quality

### Logging

The system provides comprehensive logging:

- **Installation Logs**: Cursor CLI setup status
- **Analysis Logs**: Detailed analysis process
- **Error Logs**: Failure reasons and fallback triggers
- **Performance Logs**: Timing and resource usage

## Future Enhancements

### Planned Improvements

1. **Enhanced Context**: Include more repository information
2. **Better Parsing**: Improved AI output parsing
3. **Fix Validation**: Test fixes before proposing
4. **Learning System**: Improve based on success patterns
5. **Team Configuration**: Customizable analysis parameters

### Integration Opportunities

- **LangSmith**: Enhanced observability and tracing
- **Security Scanning**: Integration with security tools
- **Code Quality**: Enhanced quality metrics
- **Team Notifications**: Slack/email integration

## Troubleshooting

### Common Problems

**Installation Issues:**
```bash
# Manual installation
curl -fsSL https://cursor.com/install | bash
export PATH="$HOME/.cursor/bin:$PATH"
```

**API Key Problems:**
```bash
# Test API key
curl -H "Authorization: Bearer $CURSOR_API_KEY" https://api.cursor.com/v1/models
```

**Analysis Failures:**
```bash
# Debug analysis script
node scripts/cursor-analysis.js --debug
```

### Support

For issues with this integration:

1. Check GitHub Actions logs
2. Review analysis report output
3. Test Cursor CLI manually
4. Verify environment configuration

## Security Considerations

### API Key Security

- **Secret Storage**: API keys stored in GitHub secrets
- **Access Control**: Minimal required permissions
- **Audit Trail**: All API calls logged
- **Rotation**: Regular key rotation recommended

### Code Safety

- **Review Process**: All fixes require human review
- **Limited Scope**: Only safe, additive changes
- **Validation**: Fixes tested before proposing
- **Rollback**: Easy reversion of automated changes

---

*This integration represents a significant step toward our long-term vision of fully automated CI failure resolution with intelligent AI-powered analysis.*
