# GitHub Actions Testing

This directory contains testing artifacts for GitHub Actions workflows.

## Directory Structure

```
.github/testing/
├── events/           # Test event payloads for act
├── secrets/          # Secret templates and examples
└── README.md         # This file
```

## Files

### Events (`events/`)
- `dryrun.pr16.json` - Test event payload for PR #16 dry-run testing

### Secrets (`secrets/`)
- `.secrets.example` - Template for local act testing secrets
- `.secrets` - Your actual secrets (gitignored, create from example)

## Usage

### Local Testing with act

The production workflow (`auto-fix-ci.yml`) now supports both CI failures and local testing via `workflow_dispatch`.

1. **Copy secrets template**:
   ```bash
   cp .github/testing/secrets/.secrets.example .github/testing/secrets/.secrets
   ```

2. **Edit secrets**:
   ```bash
   # Add your actual API keys to .github/testing/secrets/.secrets
   CURSOR_API_KEY=sk-your_actual_key
   GH_TOKEN=ghp_your_actual_token
   ```

3. **Run the production workflow locally**:
   ```bash
   act -j analyze-and-fix -W .github/workflows/auto-fix-ci.yml \
       --input pr_number=16 \
       --input head_branch=test-auto-fix-1758298659 \
       --input base_branch=main \
       --input run_id=17979799015 \
       --input run_url=https://github.com/daviswhitehead/chef-chopsky/actions/runs/17979799015 \
       --secret-file .github/testing/secrets/.secrets \
       --container-architecture linux/amd64 \
       -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-22.04
   ```

### Using Test Events

For testing with specific event payloads:
```bash
act -j analyze-and-fix -W .github/workflows/auto-fix-ci.yml \
    --eventpath .github/testing/events/dryrun.pr16.json \
    --secret-file .github/testing/secrets/.secrets \
    --container-architecture linux/amd64 \
    -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-22.04
```

## Key Features

- **Single workflow**: `auto-fix-ci.yml` handles both CI failures and local testing
- **workflow_dispatch**: Manual trigger with optional inputs for local testing
- **Guarded operations**: Branch creation/push only runs on `workflow_run` (not local)
- **Proper fallbacks**: Uses inputs when available, falls back to extracted context

## Security Notes

- Never commit actual secrets to git
- The `.secrets` file is gitignored
- Use `.secrets.example` as a template only
- Rotate tokens regularly
