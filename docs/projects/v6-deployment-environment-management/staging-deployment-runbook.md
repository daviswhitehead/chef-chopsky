# Staging Deployment Runbook

## Overview
This runbook provides comprehensive guidance for managing staging deployments on feature branches and the staging branch for Chef Chopsky.

## Quick Reference

### Deployment URLs
- **Staging Branch**: `https://chef-chopsky-git-staging.vercel.app`
- **Feature Branches**: `https://chef-chopsky-git-{branch-name}.vercel.app`
- **Agent (Shared)**: `https://chef-chopsky-staging.up.railway.app`
- **Health Check**: `https://chef-chopsky-staging.up.railway.app/health`

### Workflow Triggers
- **Automatic**: Push to `staging`, `feat/*`, `feature/*` branches
- **Manual**: GitHub Actions UI → "Staging Deployment" → Run workflow
- **Pull Requests**: Automatic staging deployment for validation

## Pre-Deployment Checklist

### ✅ Required Secrets
Verify all GitHub secrets are configured:
- `VERCEL_TOKEN` - Vercel authentication
- `VERCEL_PROJECT_ID` - Vercel project ID
- `RAILWAY_STAGING_TOKEN` - Railway staging authentication
- `RAILWAY_STAGING_PROJECT_ID` - Railway staging project ID
- `STAGING_SUPABASE_URL` - Staging database URL
- `STAGING_SUPABASE_PUBLISHABLE_KEY` - Staging database anon key
- `STAGING_SUPABASE_SECRET_KEY` - Staging database service key
- `STAGING_OPENAI_API_KEY` - OpenAI API key for staging
- `LANGCHAIN_API_KEY` - LangSmith API key

### ✅ Platform Status
- **Vercel**: Project active and accessible
- **Railway**: Staging project active and accessible
- **Supabase**: Staging project active with schema applied
- **OpenAI**: API key valid and has credits
- **Pinecone**: Staging index configured

### ✅ Branch Strategy
- **Staging branch**: `staging` exists and is up to date
- **Feature branches**: Follow `feat/*` or `feature/*` naming convention
- **Pull requests**: Target `staging` or `main` branches

## Deployment Process

### 1. Automatic Deployment

#### Staging Branch Deployment
```bash
# Push to staging branch triggers automatic deployment
git checkout staging
git pull origin staging
# Make changes
git add .
git commit -m "feat: add new feature for staging"
git push origin staging
```

#### Feature Branch Deployment
```bash
# Create feature branch
git checkout -b feat/new-recipe-search
# Make changes
git add .
git commit -m "feat: implement new recipe search"
git push -u origin feat/new-recipe-search
```

### 2. Manual Deployment

#### Via GitHub Actions UI
1. Go to repository → Actions tab
2. Select "Staging Deployment" workflow
3. Click "Run workflow"
4. Choose branch: `staging` or feature branch
5. Optionally check "Force deployment even if tests fail"
6. Click "Run workflow"

#### Via GitHub CLI
```bash
# Deploy staging branch
gh workflow run staging-deployment.yml --ref staging

# Deploy feature branch
gh workflow run staging-deployment.yml --ref feat/new-recipe-search

# Check deployment status
gh run list --workflow=staging-deployment.yml

# View deployment logs
gh run view [RUN_ID] --log
```

### 3. Pull Request Deployment
- Create pull request targeting `staging` or `main`
- Staging deployment automatically triggers
- Review deployment URL in PR comments
- Test functionality before merging

## Post-Deployment Validation

### 1. Health Checks
```bash
# Check agent health
curl -f https://chef-chopsky-staging.up.railway.app/health

# Check frontend health
curl -f https://chef-chopsky-git-staging.vercel.app
```

### 2. Functional Testing
- **Frontend**: Load homepage, navigate to chat
- **Agent**: Send test message, verify response
- **Database**: Check data persistence
- **Environment**: Verify staging-specific behavior

### 3. Environment Isolation
- **Data**: Staging data separate from production
- **URLs**: Staging URLs different from production
- **Configuration**: Staging-specific environment variables
- **Monitoring**: Staging-specific LangSmith project

## Troubleshooting

### Common Issues

#### Deployment Fails
1. **Check GitHub Actions logs** for detailed error messages
2. **Verify secrets** are correctly configured
3. **Check platform status** (Vercel, Railway, Supabase)
4. **Review branch strategy** and naming conventions

#### Health Checks Fail
1. **Agent health check fails**:
   - Check Railway staging project status
   - Verify environment variables
   - Check agent service logs
   
2. **Frontend health check fails**:
   - Check Vercel deployment status
   - Verify environment variables
   - Check build logs

#### Environment Issues
1. **Wrong environment data**:
   - Verify Supabase staging project
   - Check environment variable configuration
   - Verify Pinecone staging index
   
2. **Cross-environment data bleed**:
   - Check environment discriminators
   - Verify index/namespace naming
   - Review filter configurations

### Debugging Commands

#### Check Deployment Status
```bash
# GitHub Actions
gh run list --workflow=staging-deployment.yml --limit 10

# Vercel deployments
vercel ls --json | jq '.[0]'

# Railway deployments
railway status
```

#### Check Service Health
```bash
# Agent health
curl -s https://chef-chopsky-staging.up.railway.app/health | jq

# Frontend health
curl -s https://chef-chopsky-git-staging.vercel.app | head -20
```

#### Check Environment Variables
```bash
# Vercel environment variables
vercel env ls

# Railway environment variables
railway variables
```

## Monitoring and Alerts

### Deployment Monitoring
- **GitHub Actions**: Monitor workflow runs and failures
- **Vercel**: Monitor deployment status and build logs
- **Railway**: Monitor service health and resource usage
- **Supabase**: Monitor database performance and usage

### Alert Configuration
- **GitHub**: Repository notifications for workflow failures
- **Vercel**: Email notifications for deployment failures
- **Railway**: Email notifications for service issues
- **Supabase**: Email notifications for database issues

### Metrics to Track
- **Deployment Success Rate**: Percentage of successful deployments
- **Deployment Time**: Time from push to deployment completion
- **Health Check Response Time**: Agent and frontend response times
- **Resource Usage**: CPU, memory, and bandwidth usage

## Cost Management

### Staging Environment Costs
- **Vercel**: Free tier (100GB bandwidth, unlimited preview deployments)
- **Railway**: Free tier (100GB bandwidth, 1GB RAM)
- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **OpenAI**: Shared with production (pay-per-use)
- **Pinecone**: Separate staging index (pay-per-use)

### Cost Optimization
- **Shared Resources**: Use shared OpenAI API key
- **Preview Deployments**: Leverage Vercel's free preview deployments
- **Resource Limits**: Monitor and set appropriate limits
- **Cleanup**: Regularly clean up unused feature branch deployments

### Monthly Cost Estimates
- **Staging**: $5-15/month (Pinecone + OpenAI API usage)
- **Feature Branches**: Additional costs based on usage
- **Total**: $10-25/month for staging environment

## Security Considerations

### Access Control
- **Staging URLs**: Not publicly accessible (password protected)
- **API Keys**: Separate staging API keys when possible
- **Database**: Separate staging database with restricted access
- **Monitoring**: Staging-specific monitoring and alerting

### Data Protection
- **Test Data**: Use synthetic or anonymized data
- **User Data**: No production user data in staging
- **Secrets**: Secure secret management and rotation
- **Backups**: Regular backups of staging data

## Maintenance Procedures

### Weekly Tasks
- [ ] Review deployment success rates
- [ ] Check resource usage and costs
- [ ] Update staging data if needed
- [ ] Review and rotate secrets if required

### Monthly Tasks
- [ ] Review and update documentation
- [ ] Check for platform updates and changes
- [ ] Review cost optimization opportunities
- [ ] Test disaster recovery procedures

### Quarterly Tasks
- [ ] Review and update security practices
- [ ] Evaluate platform alternatives
- [ ] Review and update monitoring and alerting
- [ ] Conduct comprehensive security audit

## Emergency Procedures

### Rollback Procedure
1. **Identify Issue**: Determine the cause of the problem
2. **Stop Deployments**: Disable automatic deployments if needed
3. **Revert Changes**: Revert to last known good state
4. **Deploy Fix**: Deploy the fix through normal process
5. **Verify Resolution**: Confirm the issue is resolved
6. **Re-enable Deployments**: Restore automatic deployments

### Emergency Contacts
- **GitHub Issues**: Repository maintainers
- **Vercel Support**: Vercel support team
- **Railway Support**: Railway support team
- **Supabase Support**: Supabase support team

### Escalation Process
1. **Level 1**: Check logs and basic troubleshooting
2. **Level 2**: Platform-specific support channels
3. **Level 3**: Emergency contacts and escalation
4. **Level 4**: External support and consulting

## Best Practices

### Development Workflow
- **Feature Branches**: Use descriptive branch names
- **Small Changes**: Keep changes small and focused
- **Testing**: Test locally before pushing
- **Documentation**: Update documentation with changes

### Deployment Workflow
- **Staging First**: Always deploy to staging before production
- **Validation**: Validate deployments before proceeding
- **Monitoring**: Monitor deployments and health checks
- **Rollback**: Be prepared to rollback if needed

### Team Collaboration
- **Communication**: Communicate deployment status
- **Review**: Review deployments and changes
- **Feedback**: Provide feedback on staging deployments
- **Learning**: Learn from deployment issues and failures

---

*This runbook should be reviewed and updated regularly to reflect changes in the deployment process and platform configurations.*
