# Secrets Management Runbook

## Overview
This runbook provides comprehensive procedures for managing secrets across all Chef Chopsky environments, including GitHub secrets, environment variables, and service-specific credentials.

## Table of Contents
1. [Secrets Overview](#secrets-overview)
2. [GitHub Secrets Management](#github-secrets-management)
3. [Environment Variables](#environment-variables)
4. [Service-Specific Secrets](#service-specific-secrets)
5. [Secret Rotation Procedures](#secret-rotation-procedures)
6. [Emergency Procedures](#emergency-procedures)
7. [Security Best Practices](#security-best-practices)

---

## Secrets Overview

### 🔐 Secrets Categories

#### Production Secrets
- **Vercel**: Frontend deployment and configuration
- **Railway**: Agent service deployment and configuration
- **Supabase**: Production database connection and authentication
- **OpenAI**: AI functionality and API access
- **LangSmith**: AI tracing and monitoring

#### Staging Secrets
- **Vercel**: Staging frontend deployment and configuration
- **Railway**: Staging agent service deployment and configuration
- **Supabase**: Staging database connection and authentication
- **OpenAI**: Staging AI functionality and API access

#### Monitoring Secrets
- **UptimeRobot**: Uptime monitoring and alerting
- **Sentry**: Error tracking and performance monitoring
- **Webhooks**: Notification channels (Slack, Discord, etc.)

### 📊 Secrets Inventory

#### Complete Secrets List
| Category | Secret Name | Environment | Service | Purpose |
|----------|-------------|-------------|---------|---------|
| **Deployment** | `VERCEL_TOKEN` | All | Vercel | Frontend deployment |
| **Deployment** | `VERCEL_PROJECT_ID` | All | Vercel | Frontend project ID |
| **Deployment** | `RAILWAY_TOKEN` | Production | Railway | Agent deployment |
| **Deployment** | `RAILWAY_PROJECT_ID` | Production | Railway | Agent project ID |
| **Deployment** | `RAILWAY_STAGING_TOKEN` | Staging | Railway | Staging agent deployment |
| **Deployment** | `RAILWAY_STAGING_PROJECT_ID` | Staging | Railway | Staging agent project ID |
| **Database** | `PRODUCTION_SUPABASE_URL` | Production | Supabase | Production database URL |
| **Database** | `PRODUCTION_SUPABASE_PUBLISHABLE_KEY` | Production | Supabase | Production anon key |
| **Database** | `PRODUCTION_SUPABASE_SECRET_KEY` | Production | Supabase | Production service key |
| **Database** | `STAGING_SUPABASE_URL` | Staging | Supabase | Staging database URL |
| **Database** | `STAGING_SUPABASE_PUBLISHABLE_KEY` | Staging | Supabase | Staging anon key |
| **Database** | `STAGING_SUPABASE_SECRET_KEY` | Staging | Supabase | Staging service key |
| **AI** | `PRODUCTION_OPENAI_API_KEY` | Production | OpenAI | Production AI access |
| **AI** | `STAGING_OPENAI_API_KEY` | Staging | OpenAI | Staging AI access |
| **AI** | `LANGCHAIN_API_KEY` | All | LangSmith | AI tracing |
| **Monitoring** | `ALERT_WEBHOOK_URL` | All | Webhooks | Alert notifications |
| **Monitoring** | `UPTIME_ROBOT_API_KEY` | All | UptimeRobot | Uptime monitoring |
| **Monitoring** | `UPTIME_ROBOT_PROD_FRONTEND_ID` | Production | UptimeRobot | Production frontend monitor |
| **Monitoring** | `UPTIME_ROBOT_PROD_AGENT_ID` | Production | UptimeRobot | Production agent monitor |
| **Monitoring** | `UPTIME_ROBOT_STAGING_FRONTEND_ID` | Staging | UptimeRobot | Staging frontend monitor |
| **Monitoring** | `UPTIME_ROBOT_STAGING_AGENT_ID` | Staging | UptimeRobot | Staging agent monitor |
| **Monitoring** | `SENTRY_DSN` | All | Sentry | Error tracking |
| **Monitoring** | `SENTRY_AUTH_TOKEN` | All | Sentry | Error tracking auth |

---

## GitHub Secrets Management

### 🔧 Adding Secrets to GitHub

#### Via GitHub Web Interface
1. **Navigate to Repository**:
   - Go to your GitHub repository
   - Click on "Settings" tab
   - In the left sidebar, click "Secrets and variables" → "Actions"

2. **Add New Secret**:
   - Click "New repository secret"
   - Enter the secret name (exactly as listed in inventory)
   - Enter the secret value
   - Click "Add secret"

3. **Verify Secret**:
   - Confirm the secret appears in the list
   - Test the secret in a workflow run

#### Via GitHub CLI
```bash
# Add a secret
gh secret set SECRET_NAME --body "SECRET_VALUE"

# List all secrets
gh secret list

# Delete a secret
gh secret delete SECRET_NAME
```

### 📋 GitHub Secrets Procedures

#### Adding New Secret
1. **Identify Requirement**: Determine what secret is needed
2. **Obtain Secret Value**: Get the actual secret value from the service
3. **Add to GitHub**: Use web interface or CLI
4. **Test Secret**: Verify the secret works in a test deployment
5. **Document Secret**: Update this runbook with the new secret

#### Updating Existing Secret
1. **Plan Update**: Schedule update during maintenance window
2. **Obtain New Value**: Get new secret value from service
3. **Update GitHub**: Replace old secret with new one
4. **Test Update**: Verify the updated secret works
5. **Monitor Deployment**: Watch for any issues

#### Removing Secret
1. **Verify Removal**: Ensure secret is no longer needed
2. **Remove from GitHub**: Delete secret from repository
3. **Update Workflows**: Remove secret references from workflows
4. **Test Removal**: Verify workflows still work without secret
5. **Document Removal**: Update this runbook

### 🔍 Secret Validation

#### Pre-Deployment Validation
- [ ] All required secrets are present
- [ ] Secret names match exactly
- [ ] Secret values are valid
- [ ] Secrets are accessible to workflows

#### Post-Deployment Validation
- [ ] Services are accessible
- [ ] Authentication is working
- [ ] No secret-related errors
- [ ] Monitoring is active

---

## Environment Variables

### 🌍 Environment Variable Overview

#### Production Environment Variables
```bash
# Frontend (Vercel)
NEXT_PUBLIC_SUPABASE_URL=${{ secrets.PRODUCTION_SUPABASE_URL }}
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${{ secrets.PRODUCTION_SUPABASE_PUBLISHABLE_KEY }}
SUPABASE_SECRET_KEY=${{ secrets.PRODUCTION_SUPABASE_SECRET_KEY }}
AGENT_SERVICE_URL=https://chef-chopsky-production.up.railway.app
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Agent (Railway)
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=${{ secrets.PRODUCTION_OPENAI_API_KEY }}
LANGCHAIN_TRACING=true
LANGCHAIN_PROJECT=chef-chopsky-production
LANGCHAIN_API_KEY=${{ secrets.LANGCHAIN_API_KEY }}
FRONTEND_URL=https://chef-chopsky-production.vercel.app
RETRIEVER_PROVIDER=pinecone
EMBEDDING_MODEL=openai/text-embedding-3-small
LANGCHAIN_INDEX_NAME=chef-chopsky-production
APP_ENV=production
```

#### Staging Environment Variables
```bash
# Frontend (Vercel)
NEXT_PUBLIC_SUPABASE_URL=${{ secrets.STAGING_SUPABASE_URL }}
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${{ secrets.STAGING_SUPABASE_PUBLISHABLE_KEY }}
SUPABASE_SECRET_KEY=${{ secrets.STAGING_SUPABASE_SECRET_KEY }}
AGENT_SERVICE_URL=https://chef-chopsky-staging.up.railway.app
NODE_ENV=staging
NEXT_PUBLIC_APP_ENV=staging

# Agent (Railway)
NODE_ENV=staging
PORT=3001
OPENAI_API_KEY=${{ secrets.STAGING_OPENAI_API_KEY }}
LANGCHAIN_TRACING=true
LANGCHAIN_PROJECT=chef-chopsky-staging
LANGCHAIN_API_KEY=${{ secrets.LANGCHAIN_API_KEY }}
FRONTEND_URL=https://chef-chopsky-git-staging.vercel.app
RETRIEVER_PROVIDER=pinecone
EMBEDDING_MODEL=openai/text-embedding-3-small
LANGCHAIN_INDEX_NAME=chef-chopsky-staging
APP_ENV=staging
```

### 🔧 Environment Variable Management

#### Setting Environment Variables

##### Vercel Environment Variables
```bash
# Via CLI
vercel env add VARIABLE_NAME production
vercel env add VARIABLE_NAME preview

# Via Dashboard
# Go to project settings → Environment Variables
# Add variable for each environment
```

##### Railway Environment Variables
```bash
# Via CLI
railway variables set VARIABLE_NAME=value

# Via Dashboard
# Go to project settings → Variables
# Add variable for the project
```

##### Supabase Environment Variables
```bash
# Via CLI
supabase secrets set VARIABLE_NAME=value

# Via Dashboard
# Go to project settings → API
# Copy URL and keys
```

#### Updating Environment Variables
1. **Plan Update**: Schedule update during maintenance window
2. **Update Service**: Update variable in the service
3. **Update GitHub**: Update corresponding secret if needed
4. **Deploy Changes**: Trigger deployment to use new variable
5. **Verify Update**: Ensure everything works with new variable

---

## Service-Specific Secrets

### 🚀 Vercel Secrets

#### Required Secrets
- `VERCEL_TOKEN`: Authentication token for Vercel CLI
- `VERCEL_PROJECT_ID`: Project ID for deployment

#### Obtaining Secrets
1. **Vercel Token**:
   - Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Click "Create Token"
   - Name: "GitHub Actions Production"
   - Copy the token

2. **Project ID**:
   - Go to your Vercel project settings
   - Copy the Project ID from the General tab

#### Secret Management
- **Rotation**: Rotate tokens quarterly
- **Access**: Limit access to necessary personnel
- **Monitoring**: Monitor token usage
- **Audit**: Audit token access regularly

### 🚂 Railway Secrets

#### Required Secrets
- `RAILWAY_TOKEN`: Authentication token for Railway CLI
- `RAILWAY_PROJECT_ID`: Project ID for deployment
- `RAILWAY_STAGING_TOKEN`: Staging authentication token
- `RAILWAY_STAGING_PROJECT_ID`: Staging project ID

#### Obtaining Secrets
1. **Railway Token**:
   - Go to [railway.app/account/tokens](https://railway.app/account/tokens)
   - Click "New Token"
   - Name: "GitHub Actions Production"
   - Copy the token

2. **Project ID**:
   - Go to your Railway project
   - Copy the Project ID from the URL or settings

#### Secret Management
- **Rotation**: Rotate tokens quarterly
- **Access**: Limit access to necessary personnel
- **Monitoring**: Monitor token usage
- **Audit**: Audit token access regularly

### 🗄️ Supabase Secrets

#### Required Secrets
- `PRODUCTION_SUPABASE_URL`: Production database URL
- `PRODUCTION_SUPABASE_PUBLISHABLE_KEY`: Production anon key
- `PRODUCTION_SUPABASE_SECRET_KEY`: Production service key
- `STAGING_SUPABASE_URL`: Staging database URL
- `STAGING_SUPABASE_PUBLISHABLE_KEY`: Staging anon key
- `STAGING_SUPABASE_SECRET_KEY`: Staging service key

#### Obtaining Secrets
1. **Database URL**:
   - Go to your Supabase project
   - Settings → API
   - Copy the Project URL

2. **Publishable Key**:
   - Go to your Supabase project
   - Settings → API
   - Copy the anon/public key

3. **Secret Key**:
   - Go to your Supabase project
   - Settings → API
   - Copy the service_role key

#### Secret Management
- **Rotation**: Rotate keys quarterly
- **Access**: Limit access to necessary personnel
- **Monitoring**: Monitor key usage
- **Audit**: Audit key access regularly

### 🤖 OpenAI Secrets

#### Required Secrets
- `PRODUCTION_OPENAI_API_KEY`: Production OpenAI API key
- `STAGING_OPENAI_API_KEY`: Staging OpenAI API key

#### Obtaining Secrets
1. **API Key**:
   - Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Name: "Chef Chopsky Production"
   - Copy the key

#### Secret Management
- **Rotation**: Rotate keys quarterly
- **Access**: Limit access to necessary personnel
- **Monitoring**: Monitor key usage and costs
- **Audit**: Audit key access regularly

### 📊 Monitoring Secrets

#### Required Secrets
- `ALERT_WEBHOOK_URL`: Webhook for notifications
- `UPTIME_ROBOT_API_KEY`: UptimeRobot API key
- `UPTIME_ROBOT_PROD_FRONTEND_ID`: Production frontend monitor ID
- `UPTIME_ROBOT_PROD_AGENT_ID`: Production agent monitor ID
- `UPTIME_ROBOT_STAGING_FRONTEND_ID`: Staging frontend monitor ID
- `UPTIME_ROBOT_STAGING_AGENT_ID`: Staging agent monitor ID
- `SENTRY_DSN`: Sentry DSN
- `SENTRY_AUTH_TOKEN`: Sentry auth token

#### Obtaining Secrets
1. **Webhook URL**:
   - Create webhook in Slack/Discord
   - Copy webhook URL

2. **UptimeRobot API Key**:
   - Go to [uptimerobot.com](https://uptimerobot.com)
   - Account → My Settings → API Settings
   - Copy API key

3. **Monitor IDs**:
   - Create monitors in UptimeRobot
   - Copy monitor ID from URL

4. **Sentry DSN**:
   - Go to [sentry.io](https://sentry.io)
   - Create project
   - Copy DSN from project settings

5. **Sentry Auth Token**:
   - Go to Sentry → Settings → Auth Tokens
   - Create new token
   - Copy token

#### Secret Management
- **Rotation**: Rotate tokens quarterly
- **Access**: Limit access to necessary personnel
- **Monitoring**: Monitor token usage
- **Audit**: Audit token access regularly

---

## Secret Rotation Procedures

### 🔄 Rotation Schedule

#### Quarterly Rotation
- **Q1**: Vercel and Railway tokens
- **Q2**: Supabase keys
- **Q3**: OpenAI API keys
- **Q4**: Monitoring tokens

#### Emergency Rotation
- **Trigger**: Security incident or compromise
- **Timeline**: Immediate rotation
- **Scope**: All affected secrets
- **Communication**: Notify all team members

### 📋 Rotation Procedures

#### Planned Rotation
1. **Plan Rotation** (1 week before):
   - [ ] Schedule rotation during maintenance window
   - [ ] Notify team of upcoming rotation
   - [ ] Prepare new secrets
   - [ ] Plan rollback if needed

2. **Execute Rotation** (During maintenance window):
   - [ ] Generate new secrets
   - [ ] Update GitHub secrets
   - [ ] Deploy changes
   - [ ] Verify functionality
   - [ ] Revoke old secrets

3. **Post-Rotation** (Within 24 hours):
   - [ ] Monitor for issues
   - [ ] Document rotation
   - [ ] Update procedures if needed
   - [ ] Notify team of completion

#### Emergency Rotation
1. **Immediate Action** (< 5 minutes):
   - [ ] Identify compromised secrets
   - [ ] Generate new secrets
   - [ ] Update GitHub secrets
   - [ ] Deploy changes immediately

2. **Communication** (< 10 minutes):
   - [ ] Notify team of rotation
   - [ ] Update stakeholders
   - [ ] Document incident
   - [ ] Plan investigation

3. **Follow-up** (< 24 hours):
   - [ ] Investigate compromise
   - [ ] Implement additional security measures
   - [ ] Update procedures
   - [ ] Conduct post-mortem

### 🔧 Rotation Methods

#### Vercel Token Rotation
1. **Generate New Token**:
   - Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Create new token
   - Copy new token

2. **Update GitHub Secret**:
   - Update `VERCEL_TOKEN` secret
   - Test deployment

3. **Revoke Old Token**:
   - Delete old token from Vercel
   - Verify old token no longer works

#### Railway Token Rotation
1. **Generate New Token**:
   - Go to [railway.app/account/tokens](https://railway.app/account/tokens)
   - Create new token
   - Copy new token

2. **Update GitHub Secret**:
   - Update `RAILWAY_TOKEN` secret
   - Test deployment

3. **Revoke Old Token**:
   - Delete old token from Railway
   - Verify old token no longer works

#### Supabase Key Rotation
1. **Generate New Keys**:
   - Go to Supabase project settings
   - Generate new service role key
   - Copy new key

2. **Update GitHub Secret**:
   - Update `PRODUCTION_SUPABASE_SECRET_KEY` secret
   - Test deployment

3. **Revoke Old Key**:
   - Delete old key from Supabase
   - Verify old key no longer works

#### OpenAI Key Rotation
1. **Generate New Key**:
   - Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create new key
   - Copy new key

2. **Update GitHub Secret**:
   - Update `PRODUCTION_OPENAI_API_KEY` secret
   - Test deployment

3. **Revoke Old Key**:
   - Delete old key from OpenAI
   - Verify old key no longer works

---

## Emergency Procedures

### 🚨 Emergency Response

#### Secret Compromise
1. **Immediate Action** (< 5 minutes):
   - [ ] Identify compromised secret
   - [ ] Rotate secret immediately
   - [ ] Update GitHub secret
   - [ ] Deploy changes

2. **Investigation** (< 1 hour):
   - [ ] Investigate how secret was compromised
   - [ ] Check for unauthorized access
   - [ ] Review access logs
   - [ ] Document findings

3. **Prevention** (< 24 hours):
   - [ ] Implement additional security measures
   - [ ] Update procedures
   - [ ] Train team on security
   - [ ] Conduct security audit

#### Service Outage
1. **Immediate Action** (< 5 minutes):
   - [ ] Check service status
   - [ ] Verify secrets are correct
   - [ ] Check recent deployments
   - [ ] Restart services if needed

2. **Investigation** (< 30 minutes):
   - [ ] Check service logs
   - [ ] Verify infrastructure status
   - [ ] Check for configuration issues
   - [ ] Document findings

3. **Resolution** (< 2 hours):
   - [ ] Implement fix
   - [ ] Test solution
   - [ ] Deploy fix
   - [ ] Verify resolution

### 📞 Emergency Contacts

#### Internal Contacts
- **Primary On-Call**: [Contact Information]
- **Secondary On-Call**: [Contact Information]
- **Team Lead**: [Contact Information]
- **Engineering Manager**: [Contact Information]

#### External Contacts
- **Vercel Support**: [Vercel Support Contact]
- **Railway Support**: [Railway Support Contact]
- **Supabase Support**: [Supabase Support Contact]
- **OpenAI Support**: [OpenAI Support Contact]

---

## Security Best Practices

### 🛡️ Secret Security

#### Storage Security
- ✅ **Never commit secrets to code**
- ✅ **Use GitHub Secrets for CI/CD**
- ✅ **Use environment variables for runtime**
- ✅ **Encrypt secrets at rest**
- ✅ **Use secure transmission**

#### Access Security
- ✅ **Limit access to necessary personnel**
- ✅ **Use least-privilege access**
- ✅ **Monitor secret access**
- ✅ **Audit secret usage regularly**
- ✅ **Use strong, unique secrets**

#### Rotation Security
- ✅ **Rotate secrets regularly**
- ✅ **Use automated rotation when possible**
- ✅ **Monitor for compromised secrets**
- ✅ **Have emergency rotation procedures**
- ✅ **Document all rotations**

### 🔍 Security Monitoring

#### Access Monitoring
- **GitHub Actions**: Monitor workflow runs and secret usage
- **Service Logs**: Monitor service access logs
- **Audit Logs**: Review audit logs regularly
- **Access Patterns**: Monitor unusual access patterns

#### Security Alerts
- **Failed Authentication**: Alert on failed authentication attempts
- **Unauthorized Access**: Alert on unauthorized access attempts
- **Suspicious Activity**: Alert on suspicious activity patterns
- **Security Incidents**: Alert on security incidents

### 📋 Security Checklist

#### Pre-Deployment Security
- [ ] All secrets are properly configured
- [ ] Secrets are not exposed in logs
- [ ] Access is limited to necessary personnel
- [ ] Security monitoring is active

#### Post-Deployment Security
- [ ] Services are accessible only to authorized users
- [ ] No secrets are exposed in public URLs
- [ ] Security monitoring is working
- [ ] Access logs are being collected

#### Ongoing Security
- [ ] Regular security audits
- [ ] Regular secret rotation
- [ ] Regular access review
- [ ] Regular security training

---

*This runbook should be reviewed and updated regularly to reflect changes in secrets, procedures, and security requirements.*
