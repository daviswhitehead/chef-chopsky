# Environment Setup Runbook

## Overview
This runbook provides comprehensive procedures for setting up and managing all Chef Chopsky environments, including production, staging, and feature environments.

## Table of Contents
1. [Environment Overview](#environment-overview)
2. [Production Environment Setup](#production-environment-setup)
3. [Staging Environment Setup](#staging-environment-setup)
4. [Feature Environment Setup](#feature-environment-setup)
5. [Environment Validation](#environment-validation)
6. [Environment Maintenance](#environment-maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Environment Overview

### 🌍 Environment Architecture

#### Production Environment
- **Frontend**: `https://chef-chopsky-production.vercel.app`
- **Agent**: `https://chef-chopsky-production.up.railway.app`
- **Database**: Production Supabase project
- **Branch**: `main`
- **Purpose**: Live application for users
- **Monitoring**: Full monitoring and alerting

#### Staging Environment
- **Frontend**: `https://chef-chopsky-git-staging.vercel.app`
- **Agent**: `https://chef-chopsky-staging.up.railway.app`
- **Database**: Staging Supabase project
- **Branch**: `staging`
- **Purpose**: Testing before production
- **Monitoring**: Staging monitoring

#### Feature Environments
- **Frontend**: `https://chef-chopsky-git-{branch-name}.vercel.app`
- **Agent**: `https://chef-chopsky-staging.up.railway.app` (shared)
- **Database**: Staging Supabase project (shared)
- **Branch**: `feat/*` or `feature/*`
- **Purpose**: Feature testing and validation
- **Monitoring**: Basic monitoring

### 🔧 Environment Components

#### Frontend Components
- **Platform**: Vercel
- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Automatic on branch push

#### Backend Components
- **Platform**: Railway
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Deployment**: Automatic on branch push

#### Database Components
- **Platform**: Supabase
- **Database**: PostgreSQL
- **Features**: Real-time, Auth, Storage
- **Deployment**: Manual migration

#### Monitoring Components
- **Uptime**: UptimeRobot
- **Errors**: Sentry
- **Alerts**: Webhooks (Slack/Discord)
- **Logs**: GitHub Actions, Vercel, Railway

---

## Production Environment Setup

### 🚀 Production Setup Overview

#### Prerequisites
- [ ] GitHub repository access
- [ ] Vercel account
- [ ] Railway account
- [ ] Supabase account
- [ ] OpenAI account
- [ ] Monitoring accounts (UptimeRobot, Sentry)

#### Setup Timeline
- **Initial Setup**: 2-4 hours
- **Configuration**: 1-2 hours
- **Testing**: 1-2 hours
- **Total**: 4-8 hours

### 📋 Production Setup Checklist

#### 1. Service Account Setup
- [ ] Create Vercel account
- [ ] Create Railway account
- [ ] Create Supabase account
- [ ] Create OpenAI account
- [ ] Create monitoring accounts

#### 2. Project Creation
- [ ] Create Vercel project
- [ ] Create Railway project
- [ ] Create Supabase project
- [ ] Configure project settings

#### 3. Secret Configuration
- [ ] Add Vercel secrets to GitHub
- [ ] Add Railway secrets to GitHub
- [ ] Add Supabase secrets to GitHub
- [ ] Add OpenAI secrets to GitHub
- [ ] Add monitoring secrets to GitHub

#### 4. Deployment Configuration
- [ ] Configure Vercel deployment
- [ ] Configure Railway deployment
- [ ] Configure Supabase database
- [ ] Configure monitoring

#### 5. Testing and Validation
- [ ] Test frontend deployment
- [ ] Test agent deployment
- [ ] Test database connection
- [ ] Test monitoring
- [ ] Test end-to-end functionality

### 🔧 Production Setup Procedures

#### Vercel Production Setup
1. **Create Project**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import Git repository
   - Set project name: `chef-chopsky`
   - Set root directory: `frontend/`
   - Set framework: Next.js

2. **Configure Environment Variables**:
   - Go to project settings → Environment Variables
   - Add production environment variables
   - Set environment: Production
   - Save variables

3. **Configure Deployment**:
   - Set branch: `main`
   - Set build command: `npm run build`
   - Set output directory: `.next`
   - Enable automatic deployments

#### Railway Production Setup
1. **Create Project**:
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"
   - Select repository
   - Choose `agent/` folder

2. **Configure Environment Variables**:
   - Go to project settings → Variables
   - Add production environment variables
   - Set environment: Production
   - Save variables

3. **Configure Deployment**:
   - Set branch: `main`
   - Set build command: `npm install && npm run build`
   - Set start command: `node dist/src/server.js`
   - Enable automatic deployments

#### Supabase Production Setup
1. **Create Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Set project name: `chef-chopsky-production`
   - Set database password
   - Choose region
   - Create project

2. **Configure Database**:
   - Go to project settings → API
   - Copy project URL and keys
   - Configure database schema
   - Set up migrations

3. **Configure Environment Variables**:
   - Add Supabase URL to GitHub secrets
   - Add Supabase keys to GitHub secrets
   - Configure environment variables

#### Monitoring Production Setup
1. **UptimeRobot Setup**:
   - Go to [uptimerobot.com](https://uptimerobot.com)
   - Create account
   - Add monitors for production URLs
   - Configure alert contacts
   - Add API key to GitHub secrets

2. **Sentry Setup**:
   - Go to [sentry.io](https://sentry.io)
   - Create account
   - Create project for production
   - Configure DSN and auth token
   - Add to GitHub secrets

3. **Webhook Setup**:
   - Create webhook in Slack/Discord
   - Copy webhook URL
   - Add to GitHub secrets
   - Test webhook

---

## Staging Environment Setup

### 🧪 Staging Setup Overview

#### Prerequisites
- [ ] Production environment setup complete
- [ ] Staging service accounts
- [ ] Staging project access

#### Setup Timeline
- **Initial Setup**: 1-2 hours
- **Configuration**: 1 hour
- **Testing**: 1 hour
- **Total**: 3-4 hours

### 📋 Staging Setup Checklist

#### 1. Service Account Setup
- [ ] Create staging Vercel project
- [ ] Create staging Railway project
- [ ] Create staging Supabase project
- [ ] Configure staging monitoring

#### 2. Project Creation
- [ ] Create Vercel staging project
- [ ] Create Railway staging project
- [ ] Create Supabase staging project
- [ ] Configure project settings

#### 3. Secret Configuration
- [ ] Add staging Vercel secrets to GitHub
- [ ] Add staging Railway secrets to GitHub
- [ ] Add staging Supabase secrets to GitHub
- [ ] Add staging monitoring secrets to GitHub

#### 4. Deployment Configuration
- [ ] Configure Vercel staging deployment
- [ ] Configure Railway staging deployment
- [ ] Configure Supabase staging database
- [ ] Configure staging monitoring

#### 5. Testing and Validation
- [ ] Test staging frontend deployment
- [ ] Test staging agent deployment
- [ ] Test staging database connection
- [ ] Test staging monitoring
- [ ] Test end-to-end functionality

### 🔧 Staging Setup Procedures

#### Vercel Staging Setup
1. **Create Project**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import Git repository
   - Set project name: `chef-chopsky-staging`
   - Set root directory: `frontend/`
   - Set framework: Next.js

2. **Configure Environment Variables**:
   - Go to project settings → Environment Variables
   - Add staging environment variables
   - Set environment: Preview
   - Save variables

3. **Configure Deployment**:
   - Set branch: `staging`
   - Set build command: `npm run build`
   - Set output directory: `.next`
   - Enable automatic deployments

#### Railway Staging Setup
1. **Create Project**:
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"
   - Select repository
   - Choose `agent/` folder

2. **Configure Environment Variables**:
   - Go to project settings → Variables
   - Add staging environment variables
   - Set environment: Staging
   - Save variables

3. **Configure Deployment**:
   - Set branch: `staging`
   - Set build command: `npm install && npm run build`
   - Set start command: `node dist/src/server.js`
   - Enable automatic deployments

#### Supabase Staging Setup
1. **Create Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Set project name: `chef-chopsky-staging`
   - Set database password
   - Choose region
   - Create project

2. **Configure Database**:
   - Go to project settings → API
   - Copy project URL and keys
   - Configure database schema
   - Set up migrations

3. **Configure Environment Variables**:
   - Add staging Supabase URL to GitHub secrets
   - Add staging Supabase keys to GitHub secrets
   - Configure environment variables

---

## Feature Environment Setup

### 🔧 Feature Environment Overview

#### Prerequisites
- [ ] Staging environment setup complete
- [ ] Feature branch created
- [ ] Feature development complete

#### Setup Timeline
- **Automatic Setup**: 5-10 minutes
- **Manual Configuration**: 15-30 minutes
- **Testing**: 15-30 minutes
- **Total**: 30-60 minutes

### 📋 Feature Environment Checklist

#### 1. Branch Creation
- [ ] Create feature branch
- [ ] Push branch to GitHub
- [ ] Verify branch naming convention

#### 2. Automatic Setup
- [ ] GitHub Actions workflow triggers
- [ ] Vercel creates preview deployment
- [ ] Railway deploys to staging
- [ ] Monitoring activates

#### 3. Manual Configuration
- [ ] Configure feature-specific settings
- [ ] Test feature functionality
- [ ] Verify environment isolation
- [ ] Share preview URL

#### 4. Testing and Validation
- [ ] Test feature functionality
- [ ] Test integration with staging services
- [ ] Verify environment isolation
- [ ] Test end-to-end functionality

### 🔧 Feature Environment Procedures

#### Feature Branch Creation
1. **Create Branch**:
   ```bash
   git checkout -b feat/new-feature
   git push -u origin feat/new-feature
   ```

2. **Verify Naming**:
   - Use `feat/` or `feature/` prefix
   - Use descriptive names
   - Follow naming conventions

#### Automatic Deployment
1. **GitHub Actions**:
   - Workflow automatically triggers
   - Creates preview deployment
   - Deploys to staging services
   - Activates monitoring

2. **Vercel Preview**:
   - Creates preview deployment
   - Generates preview URL
   - Configures environment variables
   - Enables automatic deployments

3. **Railway Staging**:
   - Deploys to staging project
   - Configures environment variables
   - Enables automatic deployments
   - Activates monitoring

#### Manual Configuration
1. **Feature-Specific Settings**:
   - Configure feature flags
   - Set feature-specific environment variables
   - Configure feature-specific monitoring
   - Test feature functionality

2. **Environment Isolation**:
   - Verify feature data isolation
   - Test feature-specific functionality
   - Verify no cross-environment data bleed
   - Test feature-specific monitoring

---

## Environment Validation

### ✅ Validation Checklist

#### Service Health Validation
- [ ] All services are accessible
- [ ] Health endpoints are responding
- [ ] Response times are acceptable
- [ ] Error rates are normal

#### Functionality Validation
- [ ] Core features are working
- [ ] User flows are functional
- [ ] Data integrity is maintained
- [ ] Performance is acceptable

#### Integration Validation
- [ ] Frontend-backend integration works
- [ ] Database connections are stable
- [ ] External services are accessible
- [ ] Monitoring is active

#### Security Validation
- [ ] Environment isolation is maintained
- [ ] Secrets are properly configured
- [ ] Access controls are in place
- [ ] Security monitoring is active

### 🔍 Validation Procedures

#### Automated Validation
- [ ] Health check tests pass
- [ ] Integration tests pass
- [ ] Performance tests pass
- [ ] Security tests pass

#### Manual Validation
- [ ] Core user flows work
- [ ] Critical features function
- [ ] Data is accessible
- [ ] Performance is acceptable

#### Monitoring Validation
- [ ] Monitoring is active
- [ ] Alerts are working
- [ ] Metrics are normal
- [ ] Logs are being collected

---

## Environment Maintenance

### 📅 Maintenance Schedule

#### Daily Maintenance
- [ ] Check service health
- [ ] Review monitoring alerts
- [ ] Verify environment status
- [ ] Check deployment status

#### Weekly Maintenance
- [ ] Review environment metrics
- [ ] Check for updates
- [ ] Verify monitoring configuration
- [ ] Review security status

#### Monthly Maintenance
- [ ] Review environment performance
- [ ] Check for security updates
- [ ] Verify backup procedures
- [ ] Review monitoring thresholds

#### Quarterly Maintenance
- [ ] Review environment architecture
- [ ] Check for new features
- [ ] Verify disaster recovery procedures
- [ ] Review security policies

### 🔧 Maintenance Procedures

#### Service Updates
1. **Plan Updates**:
   - Schedule updates during maintenance window
   - Test updates in staging
   - Plan rollback if needed
   - Notify team

2. **Execute Updates**:
   - Deploy updates to staging
   - Test updates thoroughly
   - Deploy updates to production
   - Monitor for issues

3. **Post-Update**:
   - Verify functionality
   - Monitor performance
   - Check for issues
   - Document changes

#### Configuration Updates
1. **Plan Changes**:
   - Identify configuration changes needed
   - Test changes in staging
   - Plan deployment approach
   - Notify team

2. **Execute Changes**:
   - Deploy configuration changes
   - Test configuration changes
   - Verify functionality
   - Monitor for issues

3. **Post-Change**:
   - Verify configuration
   - Monitor performance
   - Check for issues
   - Document changes

---

## Troubleshooting

### 🔍 Common Issues

#### Environment Setup Issues
- **Service Creation Fails**: Check account permissions, verify service availability
- **Configuration Issues**: Verify environment variables, check service settings
- **Deployment Fails**: Check GitHub secrets, verify service configuration
- **Integration Issues**: Check service URLs, verify network connectivity

#### Environment Validation Issues
- **Health Checks Fail**: Check service status, verify health endpoints
- **Functionality Issues**: Check service logs, verify configuration
- **Performance Issues**: Check resource usage, analyze performance metrics
- **Security Issues**: Check access controls, verify security configuration

#### Environment Maintenance Issues
- **Update Failures**: Check update logs, verify compatibility
- **Configuration Issues**: Check configuration logs, verify settings
- **Monitoring Issues**: Check monitoring configuration, verify alert settings
- **Backup Issues**: Check backup procedures, verify backup integrity

### 🛠️ Troubleshooting Tools

#### Debugging Commands
```bash
# Check service health
curl -f https://chef-chopsky-production.up.railway.app/health
curl -f https://chef-chopsky-staging.up.railway.app/health

# Check deployment status
gh run list --workflow=production-deployment.yml
gh run list --workflow=staging-deployment.yml

# Check service status
railway status
vercel ls

# Check environment variables
vercel env ls
railway variables
```

#### Log Analysis
- **GitHub Actions**: Workflow logs and build logs
- **Vercel**: Deployment logs and function logs
- **Railway**: Service logs and deployment logs
- **Supabase**: Database logs and API logs

#### Performance Analysis
- **Response Times**: Monitor response times and trends
- **Error Rates**: Track error rates and patterns
- **Resource Usage**: Monitor CPU, memory, and bandwidth usage
- **Database Performance**: Track query performance and optimization

---

*This runbook should be reviewed and updated regularly to reflect changes in environment setup, procedures, and team structure.*
