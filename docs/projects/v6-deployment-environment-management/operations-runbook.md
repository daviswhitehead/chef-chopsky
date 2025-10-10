# Chef Chopsky Operations Runbook

## Overview
This runbook provides comprehensive operational procedures for Chef Chopsky, including secrets management, environment setup, deployment procedures, and incident response.

## Table of Contents
1. [Secrets Management](#secrets-management)
2. [Environment Setup](#environment-setup)
3. [Deployment Procedures](#deployment-procedures)
4. [Rollback Procedures](#rollback-procedures)
5. [Incident Response](#incident-response)
6. [Maintenance Procedures](#maintenance-procedures)
7. [Troubleshooting](#troubleshooting)

---

## Secrets Management

### 🔐 GitHub Secrets Overview

#### Production Secrets
| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel authentication | Frontend deployment |
| `VERCEL_PROJECT_ID` | Vercel project ID | Frontend deployment |
| `RAILWAY_TOKEN` | Railway authentication | Agent deployment |
| `RAILWAY_PROJECT_ID` | Railway project ID | Agent deployment |
| `PRODUCTION_SUPABASE_URL` | Production database URL | Database connection |
| `PRODUCTION_SUPABASE_PUBLISHABLE_KEY` | Production anon key | Database connection |
| `PRODUCTION_SUPABASE_SECRET_KEY` | Production service key | Database connection |
| `PRODUCTION_OPENAI_API_KEY` | OpenAI API key | AI functionality |
| `LANGCHAIN_API_KEY` | LangSmith API key | AI tracing |

#### Staging Secrets
| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `RAILWAY_STAGING_TOKEN` | Railway staging auth | Staging agent deployment |
| `RAILWAY_STAGING_PROJECT_ID` | Railway staging project ID | Staging agent deployment |
| `STAGING_SUPABASE_URL` | Staging database URL | Staging database connection |
| `STAGING_SUPABASE_PUBLISHABLE_KEY` | Staging anon key | Staging database connection |
| `STAGING_SUPABASE_SECRET_KEY` | Staging service key | Staging database connection |
| `STAGING_OPENAI_API_KEY` | OpenAI API key for staging | Staging AI functionality |

#### Monitoring Secrets
| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `ALERT_WEBHOOK_URL` | Webhook for notifications | Alert notifications |
| `UPTIME_ROBOT_API_KEY` | UptimeRobot API key | Uptime monitoring |
| `UPTIME_ROBOT_PROD_FRONTEND_ID` | Production frontend monitor ID | Uptime monitoring |
| `UPTIME_ROBOT_PROD_AGENT_ID` | Production agent monitor ID | Uptime monitoring |
| `UPTIME_ROBOT_STAGING_FRONTEND_ID` | Staging frontend monitor ID | Uptime monitoring |
| `UPTIME_ROBOT_STAGING_AGENT_ID` | Staging agent monitor ID | Uptime monitoring |
| `SENTRY_DSN` | Sentry DSN | Error tracking |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | Error tracking |

### 🔧 Secrets Management Procedures

#### Adding New Secrets
1. **Identify Required Secret**: Determine what secret is needed
2. **Obtain Secret Value**: Get the actual secret value from the service
3. **Add to GitHub**: Go to repository → Settings → Secrets and variables → Actions
4. **Test Secret**: Verify the secret works in a test deployment
5. **Document Secret**: Update this runbook with the new secret

#### Rotating Secrets
1. **Plan Rotation**: Schedule rotation during maintenance window
2. **Generate New Secret**: Create new secret in the service
3. **Update GitHub**: Replace old secret with new one
4. **Deploy Changes**: Trigger deployment to use new secret
5. **Verify Functionality**: Ensure everything works with new secret
6. **Revoke Old Secret**: Remove old secret from the service

#### Emergency Secret Rotation
1. **Immediate Action**: If secret is compromised, rotate immediately
2. **Update GitHub**: Replace compromised secret
3. **Deploy Immediately**: Trigger emergency deployment
4. **Monitor**: Watch for any issues
5. **Document Incident**: Record the incident and response

### 🛡️ Security Best Practices

#### Secret Storage
- ✅ **Never commit secrets to code**
- ✅ **Use GitHub Secrets for CI/CD**
- ✅ **Use environment variables for runtime**
- ✅ **Rotate secrets regularly**
- ✅ **Use least-privilege access**

#### Secret Access
- ✅ **Limit access to necessary personnel**
- ✅ **Use separate secrets for different environments**
- ✅ **Monitor secret usage**
- ✅ **Audit secret access regularly**
- ✅ **Use strong, unique secrets**

---

## Environment Setup

### 🌍 Environment Overview

#### Production Environment
- **Frontend**: `https://chef-chopsky-production.vercel.app`
- **Agent**: `https://chef-chopsky-production.up.railway.app`
- **Database**: Production Supabase project
- **Branch**: `main`
- **Purpose**: Live application for users

#### Staging Environment
- **Frontend**: `https://chef-chopsky-git-staging.vercel.app`
- **Agent**: `https://chef-chopsky-staging.up.railway.app`
- **Database**: Staging Supabase project
- **Branch**: `staging`
- **Purpose**: Testing before production

#### Feature Environments
- **Frontend**: `https://chef-chopsky-git-{branch-name}.vercel.app`
- **Agent**: `https://chef-chopsky-staging.up.railway.app` (shared)
- **Database**: Staging Supabase project (shared)
- **Branch**: `feat/*` or `feature/*`
- **Purpose**: Feature testing and validation

### 🔧 Environment Setup Procedures

#### Initial Setup
1. **Create Accounts**: Set up accounts for all services
2. **Create Projects**: Create projects in each service
3. **Configure Secrets**: Add all required secrets to GitHub
4. **Deploy Services**: Deploy frontend and agent services
5. **Configure Monitoring**: Set up monitoring and alerting
6. **Test End-to-End**: Verify complete functionality

#### Adding New Environment
1. **Plan Environment**: Determine requirements and purpose
2. **Create Service Projects**: Create projects in Vercel, Railway, Supabase
3. **Configure Secrets**: Add environment-specific secrets
4. **Update Workflows**: Modify GitHub Actions workflows
5. **Deploy Services**: Deploy and configure services
6. **Test Environment**: Verify functionality and isolation

#### Environment Validation
1. **Health Checks**: Verify all services are healthy
2. **Functionality Tests**: Test core application features
3. **Integration Tests**: Verify service integration
4. **Security Tests**: Verify environment isolation
5. **Performance Tests**: Check response times and performance

### 📋 Environment Checklist

#### Pre-Deployment Checklist
- [ ] All required secrets are configured
- [ ] Service projects are created and active
- [ ] Environment variables are set correctly
- [ ] Health checks are passing
- [ ] Monitoring is configured
- [ ] Documentation is updated

#### Post-Deployment Checklist
- [ ] Services are accessible via URLs
- [ ] Health endpoints are responding
- [ ] Core functionality is working
- [ ] Monitoring is active
- [ ] Alerts are configured
- [ ] Team is notified of deployment

---

## Deployment Procedures

### 🚀 Deployment Overview

#### Production Deployment
- **Trigger**: Push to `main` branch
- **Workflow**: `production-deployment.yml`
- **Services**: Frontend (Vercel) + Agent (Railway)
- **Database**: Production Supabase
- **Monitoring**: Full monitoring and alerting

#### Staging Deployment
- **Trigger**: Push to `staging` branch
- **Workflow**: `staging-deployment.yml`
- **Services**: Frontend (Vercel) + Agent (Railway)
- **Database**: Staging Supabase
- **Monitoring**: Staging monitoring

#### Feature Deployment
- **Trigger**: Push to `feat/*` or `feature/*` branch
- **Workflow**: `staging-deployment.yml`
- **Services**: Frontend (Vercel preview) + Agent (Railway staging)
- **Database**: Staging Supabase (shared)
- **Monitoring**: Basic monitoring

### 📋 Deployment Procedures

#### Production Deployment
1. **Pre-Deployment**:
   - [ ] Code review completed
   - [ ] Tests passing
   - [ ] Staging deployment successful
   - [ ] Team approval obtained

2. **Deployment**:
   - [ ] Merge to `main` branch
   - [ ] Monitor GitHub Actions workflow
   - [ ] Verify deployment success
   - [ ] Check health endpoints

3. **Post-Deployment**:
   - [ ] Test core functionality
   - [ ] Monitor error rates
   - [ ] Check performance metrics
   - [ ] Notify team of success

#### Staging Deployment
1. **Pre-Deployment**:
   - [ ] Feature branch ready
   - [ ] Tests passing
   - [ ] Code review completed

2. **Deployment**:
   - [ ] Merge to `staging` branch
   - [ ] Monitor GitHub Actions workflow
   - [ ] Verify deployment success
   - [ ] Check health endpoints

3. **Post-Deployment**:
   - [ ] Test functionality
   - [ ] Share staging URL with team
   - [ ] Gather feedback
   - [ ] Plan production deployment

#### Feature Deployment
1. **Pre-Deployment**:
   - [ ] Feature development complete
   - [ ] Local testing successful
   - [ ] Code review completed

2. **Deployment**:
   - [ ] Push to feature branch
   - [ ] Monitor GitHub Actions workflow
   - [ ] Verify deployment success
   - [ ] Check health endpoints

3. **Post-Deployment**:
   - [ ] Test feature functionality
   - [ ] Share preview URL
   - [ ] Gather feedback
   - [ ] Plan staging deployment

### 🔄 Deployment Monitoring

#### During Deployment
- **Monitor Workflow**: Watch GitHub Actions logs
- **Check Health**: Verify health endpoints
- **Monitor Alerts**: Watch for any alerts
- **Test Functionality**: Quick smoke tests

#### Post-Deployment
- **Health Monitoring**: Continuous health checks
- **Error Monitoring**: Watch for errors
- **Performance Monitoring**: Check response times
- **User Monitoring**: Monitor user experience

---

## Rollback Procedures

### 🔄 Rollback Overview

#### When to Rollback
- **Critical Bugs**: Application crashes or data corruption
- **Performance Issues**: Significant performance degradation
- **Security Issues**: Security vulnerabilities discovered
- **User Impact**: Major user-facing issues

#### Rollback Types
1. **Hotfix Rollback**: Quick rollback to previous version
2. **Feature Rollback**: Rollback specific feature
3. **Full Rollback**: Complete rollback to last known good state
4. **Partial Rollback**: Rollback specific components

### 📋 Rollback Procedures

#### Emergency Rollback (P0)
1. **Immediate Action** (< 5 minutes):
   - [ ] Stop new deployments
   - [ ] Identify rollback target
   - [ ] Execute rollback
   - [ ] Verify rollback success

2. **Communication** (< 10 minutes):
   - [ ] Notify team of rollback
   - [ ] Update stakeholders
   - [ ] Document incident
   - [ ] Plan investigation

3. **Investigation** (< 1 hour):
   - [ ] Identify root cause
   - [ ] Plan fix
   - [ ] Test fix
   - [ ] Prepare re-deployment

#### Standard Rollback (P1-P2)
1. **Assessment** (< 15 minutes):
   - [ ] Assess impact
   - [ ] Determine rollback scope
   - [ ] Plan rollback approach
   - [ ] Notify team

2. **Execution** (< 30 minutes):
   - [ ] Execute rollback
   - [ ] Verify rollback success
   - [ ] Test functionality
   - [ ] Monitor for issues

3. **Follow-up** (< 2 hours):
   - [ ] Investigate root cause
   - [ ] Plan fix
   - [ ] Test fix
   - [ ] Prepare re-deployment

### 🔧 Rollback Methods

#### Vercel Rollback
1. **Via Dashboard**:
   - Go to Vercel dashboard
   - Select project
   - Go to Deployments
   - Click "Promote to Production" on previous deployment

2. **Via CLI**:
   ```bash
   vercel --prod --yes
   ```

#### Railway Rollback
1. **Via Dashboard**:
   - Go to Railway dashboard
   - Select project
   - Go to Deployments
   - Click "Redeploy" on previous deployment

2. **Via CLI**:
   ```bash
   railway up --detach
   ```

#### Database Rollback
1. **Supabase Rollback**:
   - Go to Supabase dashboard
   - Select project
   - Go to Database → Migrations
   - Revert to previous migration

2. **Manual Rollback**:
   - Identify affected data
   - Create backup
   - Restore from backup
   - Verify data integrity

### 📊 Rollback Monitoring

#### During Rollback
- **Monitor Progress**: Watch rollback progress
- **Check Health**: Verify health endpoints
- **Monitor Alerts**: Watch for any alerts
- **Test Functionality**: Quick smoke tests

#### Post-Rollback
- **Health Monitoring**: Continuous health checks
- **Error Monitoring**: Watch for errors
- **Performance Monitoring**: Check response times
- **User Monitoring**: Monitor user experience

---

## Incident Response

### 🚨 Incident Severity Levels

#### P0 - Critical (Immediate Response)
- **Examples**: Complete service outage, data loss, security breach
- **Response Time**: < 15 minutes
- **Escalation**: Immediate notification to all team members
- **Action**: All hands on deck, emergency procedures

#### P1 - High (Urgent Response)
- **Examples**: Major feature broken, significant performance degradation
- **Response Time**: < 1 hour
- **Escalation**: Notify team leads and stakeholders
- **Action**: Priority fix, workaround if possible

#### P2 - Medium (Normal Response)
- **Examples**: Minor feature issues, non-critical errors
- **Response Time**: < 4 hours
- **Escalation**: Notify development team
- **Action**: Plan fix for next release

#### P3 - Low (Scheduled Response)
- **Examples**: Cosmetic issues, minor improvements
- **Response Time**: < 24 hours
- **Escalation**: Add to backlog
- **Action**: Include in next sprint

### 📋 Incident Response Procedures

#### Initial Response (0-15 minutes)
- [ ] Acknowledge incident
- [ ] Assess severity level
- [ ] Notify appropriate team members
- [ ] Begin investigation
- [ ] Document initial findings

#### Investigation (15-60 minutes)
- [ ] Check service logs
- [ ] Verify infrastructure status
- [ ] Check recent deployments
- [ ] Identify root cause
- [ ] Assess impact scope
- [ ] Document findings

#### Resolution (1-4 hours)
- [ ] Implement fix
- [ ] Test solution
- [ ] Deploy fix
- [ ] Verify resolution
- [ ] Monitor for recurrence
- [ ] Document resolution

#### Post-Incident (24-48 hours)
- [ ] Conduct post-mortem
- [ ] Identify lessons learned
- [ ] Update procedures
- [ ] Implement preventive measures
- [ ] Share findings with team

### 🔧 Incident Response Tools

#### Monitoring Tools
- **GitHub Actions**: Workflow monitoring
- **UptimeRobot**: Uptime monitoring
- **Sentry**: Error tracking
- **Vercel**: Frontend monitoring
- **Railway**: Agent monitoring

#### Communication Tools
- **Slack/Discord**: Team communication
- **Email**: Stakeholder notifications
- **SMS**: Critical alerts
- **GitHub Issues**: Incident tracking

#### Investigation Tools
- **Service Logs**: Application logs
- **Infrastructure Logs**: Platform logs
- **Monitoring Dashboards**: Real-time metrics
- **Error Tracking**: Error details and stack traces

---

## Maintenance Procedures

### 📅 Maintenance Schedule

#### Daily Tasks
- [ ] Check monitoring dashboard
- [ ] Review overnight alerts
- [ ] Verify all services are healthy
- [ ] Check deployment status

#### Weekly Tasks
- [ ] Review alert frequency and content
- [ ] Check monitoring metrics trends
- [ ] Verify all monitors are working
- [ ] Review error patterns and trends

#### Monthly Tasks
- [ ] Review and update alert thresholds
- [ ] Check for new monitoring features
- [ ] Review cost and usage
- [ ] Update monitoring documentation

#### Quarterly Tasks
- [ ] Evaluate monitoring tools and alternatives
- [ ] Review and update alert procedures
- [ ] Conduct monitoring system audit
- [ ] Plan for scaling monitoring as needed

### 🔧 Maintenance Procedures

#### Secret Rotation
1. **Plan Rotation**: Schedule rotation during maintenance window
2. **Generate New Secrets**: Create new secrets in services
3. **Update GitHub**: Replace old secrets with new ones
4. **Deploy Changes**: Trigger deployment to use new secrets
5. **Verify Functionality**: Ensure everything works with new secrets
6. **Revoke Old Secrets**: Remove old secrets from services

#### Service Updates
1. **Plan Updates**: Schedule updates during maintenance window
2. **Test Updates**: Test updates in staging environment
3. **Deploy Updates**: Deploy updates to production
4. **Verify Functionality**: Ensure everything works correctly
5. **Monitor Performance**: Watch for any performance issues
6. **Document Changes**: Update documentation with changes

#### Monitoring Updates
1. **Review Metrics**: Analyze monitoring metrics and trends
2. **Update Thresholds**: Adjust alert thresholds as needed
3. **Add New Monitors**: Add monitors for new services
4. **Remove Old Monitors**: Remove monitors for deprecated services
5. **Test Alerts**: Verify all alerts are working correctly
6. **Update Documentation**: Update monitoring documentation

---

## Troubleshooting

### 🔍 Common Issues

#### Deployment Issues
- **Deployment Fails**: Check GitHub Actions logs, verify secrets
- **Service Unavailable**: Check service status, verify configuration
- **Health Check Fails**: Check health endpoints, verify service status
- **Environment Issues**: Verify environment variables, check configuration

#### Monitoring Issues
- **Alerts Not Working**: Check webhook configuration, verify alert settings
- **Health Checks Failing**: Check service status, verify network connectivity
- **UptimeRobot Issues**: Check API key, verify monitor configuration
- **Sentry Issues**: Check DSN, verify project configuration

#### Performance Issues
- **Slow Response Times**: Check resource usage, analyze performance metrics
- **High Error Rates**: Check error logs, identify error patterns
- **Memory Issues**: Check memory usage, optimize code
- **Database Issues**: Check database performance, optimize queries

### 🛠️ Troubleshooting Tools

#### Debugging Commands
```bash
# Test health endpoints
curl -f https://chef-chopsky-production.up.railway.app/health
curl -f https://chef-chopsky-staging.up.railway.app/health

# Test webhook
curl -X POST "$ALERT_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test notification"}'

# Test UptimeRobot API
curl -X POST "https://api.uptimerobot.com/v2/getMonitors" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=$UPTIME_ROBOT_API_KEY&format=json"

# Test Sentry configuration
sentry-cli --auth-token $SENTRY_AUTH_TOKEN projects list
```

#### Log Analysis
- **GitHub Actions**: Workflow logs and build logs
- **Vercel**: Deployment logs and function logs
- **Railway**: Service logs and deployment logs
- **Supabase**: Database logs and API logs
- **Sentry**: Error logs and performance logs

#### Performance Analysis
- **Response Times**: Monitor response times and trends
- **Error Rates**: Track error rates and patterns
- **Resource Usage**: Monitor CPU, memory, and bandwidth usage
- **Database Performance**: Track query performance and optimization

### 📞 Escalation Procedures

#### Level 1 Support
- **Scope**: Basic troubleshooting and monitoring
- **Response Time**: < 1 hour
- **Escalation**: To Level 2 if unresolved

#### Level 2 Support
- **Scope**: Advanced troubleshooting and configuration
- **Response Time**: < 30 minutes
- **Escalation**: To Level 3 if unresolved

#### Level 3 Support
- **Scope**: Critical issues and emergency response
- **Response Time**: < 15 minutes
- **Escalation**: To external support if needed

---

## Contact Information

### 👥 Team Contacts
- **Primary On-Call**: [Contact Information]
- **Secondary On-Call**: [Contact Information]
- **Team Lead**: [Contact Information]
- **Engineering Manager**: [Contact Information]

### 🆘 Emergency Contacts
- **Critical Issues**: [Emergency Contact]
- **Security Issues**: [Security Contact]
- **Infrastructure Issues**: [Infrastructure Contact]

### 📞 External Support
- **Vercel Support**: [Vercel Support Contact]
- **Railway Support**: [Railway Support Contact]
- **Supabase Support**: [Supabase Support Contact]
- **OpenAI Support**: [OpenAI Support Contact]

---

*This runbook should be reviewed and updated regularly to reflect changes in procedures, tools, and team structure.*
