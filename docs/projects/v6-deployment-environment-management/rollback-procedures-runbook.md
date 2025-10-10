# Rollback Procedures Runbook

## Overview
This runbook provides comprehensive procedures for rolling back deployments across all Chef Chopsky environments, including emergency rollbacks, planned rollbacks, and partial rollbacks.

## Table of Contents
1. [Rollback Overview](#rollback-overview)
2. [Emergency Rollback Procedures](#emergency-rollback-procedures)
3. [Planned Rollback Procedures](#planned-rollback-procedures)
4. [Partial Rollback Procedures](#partial-rollback-procedures)
5. [Database Rollback Procedures](#database-rollback-procedures)
6. [Rollback Validation](#rollback-validation)
7. [Post-Rollback Procedures](#post-rollback-procedures)

---

## Rollback Overview

### 🔄 Rollback Types

#### Emergency Rollback (P0)
- **Trigger**: Critical bugs, security issues, complete service outage
- **Response Time**: < 5 minutes
- **Scope**: Complete rollback to last known good state
- **Approval**: Immediate execution, no approval needed

#### Planned Rollback (P1-P2)
- **Trigger**: Major bugs, performance issues, user impact
- **Response Time**: < 30 minutes
- **Scope**: Targeted rollback of specific components
- **Approval**: Team lead approval required

#### Partial Rollback (P3)
- **Trigger**: Minor issues, feature-specific problems
- **Response Time**: < 2 hours
- **Scope**: Rollback specific features or components
- **Approval**: Developer approval required

### 📊 Rollback Decision Matrix

| Issue Type | Severity | Rollback Type | Response Time | Approval Required |
|------------|----------|---------------|---------------|-------------------|
| **Complete Service Outage** | P0 | Emergency | < 5 min | No |
| **Data Corruption** | P0 | Emergency | < 5 min | No |
| **Security Breach** | P0 | Emergency | < 5 min | No |
| **Major Feature Broken** | P1 | Planned | < 30 min | Team Lead |
| **Performance Degradation** | P1 | Planned | < 30 min | Team Lead |
| **Minor Feature Issues** | P2 | Planned | < 30 min | Team Lead |
| **Cosmetic Issues** | P3 | Partial | < 2 hours | Developer |

### 🎯 Rollback Targets

#### Production Rollback Targets
- **Last Known Good**: Previous successful deployment
- **Stable Version**: Last stable release
- **Emergency Version**: Last emergency-tested version
- **Baseline Version**: Last baseline deployment

#### Staging Rollback Targets
- **Previous Staging**: Last successful staging deployment
- **Production Copy**: Copy of current production
- **Clean Staging**: Fresh staging environment
- **Feature Branch**: Specific feature branch

---

## Emergency Rollback Procedures

### 🚨 P0 Emergency Rollback

#### Immediate Response (< 5 minutes)
1. **Stop New Deployments**:
   - [ ] Disable automatic deployments
   - [ ] Notify team of emergency
   - [ ] Begin rollback immediately

2. **Identify Rollback Target**:
   - [ ] Check last successful deployment
   - [ ] Verify rollback target is stable
   - [ ] Confirm rollback target functionality

3. **Execute Rollback**:
   - [ ] Rollback frontend (Vercel)
   - [ ] Rollback agent (Railway)
   - [ ] Rollback database if needed
   - [ ] Verify rollback success

#### Communication (< 10 minutes)
1. **Notify Team**:
   - [ ] Send emergency alert to team
   - [ ] Update stakeholders
   - [ ] Document incident
   - [ ] Plan investigation

2. **Status Updates**:
   - [ ] Provide regular status updates
   - [ ] Share rollback progress
   - [ ] Communicate resolution timeline
   - [ ] Update stakeholders

#### Investigation (< 1 hour)
1. **Root Cause Analysis**:
   - [ ] Identify root cause
   - [ ] Analyze deployment logs
   - [ ] Check service status
   - [ ] Document findings

2. **Plan Fix**:
   - [ ] Develop fix for root cause
   - [ ] Test fix in staging
   - [ ] Prepare re-deployment
   - [ ] Plan monitoring

### 🔧 Emergency Rollback Methods

#### Vercel Emergency Rollback
1. **Via Dashboard**:
   - Go to Vercel dashboard
   - Select project
   - Go to Deployments
   - Find last successful deployment
   - Click "Promote to Production"

2. **Via CLI**:
   ```bash
   # List deployments
   vercel ls
   
   # Promote specific deployment
   vercel promote [DEPLOYMENT_ID] --prod
   ```

3. **Via API**:
   ```bash
   curl -X POST "https://api.vercel.com/v1/deployments/[DEPLOYMENT_ID]/promote" \
     -H "Authorization: Bearer $VERCEL_TOKEN"
   ```

#### Railway Emergency Rollback
1. **Via Dashboard**:
   - Go to Railway dashboard
   - Select project
   - Go to Deployments
   - Find last successful deployment
   - Click "Redeploy"

2. **Via CLI**:
   ```bash
   # List deployments
   railway status
   
   # Redeploy specific deployment
   railway up --detach
   ```

3. **Via API**:
   ```bash
   curl -X POST "https://backboard.railway.app/graphql" \
     -H "Authorization: Bearer $RAILWAY_TOKEN" \
     -d '{"query": "mutation { deploymentRedeploy(id: \"[DEPLOYMENT_ID]\") { id } }"}'
   ```

#### Database Emergency Rollback
1. **Supabase Rollback**:
   - Go to Supabase dashboard
   - Select project
   - Go to Database → Migrations
   - Revert to previous migration
   - Verify data integrity

2. **Manual Rollback**:
   - Identify affected data
   - Create backup of current state
   - Restore from previous backup
   - Verify data integrity

---

## Planned Rollback Procedures

### 📋 P1-P2 Planned Rollback

#### Pre-Rollback Assessment (< 15 minutes)
1. **Impact Assessment**:
   - [ ] Assess user impact
   - [ ] Determine rollback scope
   - [ ] Plan rollback approach
   - [ ] Notify team

2. **Rollback Planning**:
   - [ ] Identify rollback target
   - [ ] Plan rollback steps
   - [ ] Prepare rollback tools
   - [ ] Schedule rollback window

#### Rollback Execution (< 30 minutes)
1. **Execute Rollback**:
   - [ ] Rollback frontend
   - [ ] Rollback agent
   - [ ] Rollback database if needed
   - [ ] Verify rollback success

2. **Validation**:
   - [ ] Test core functionality
   - [ ] Verify service health
   - [ ] Check performance metrics
   - [ ] Monitor for issues

#### Post-Rollback Follow-up (< 2 hours)
1. **Investigation**:
   - [ ] Investigate root cause
   - [ ] Analyze deployment logs
   - [ ] Check service status
   - [ ] Document findings

2. **Fix Planning**:
   - [ ] Develop fix for root cause
   - [ ] Test fix in staging
   - [ ] Prepare re-deployment
   - [ ] Plan monitoring

### 🔧 Planned Rollback Methods

#### Vercel Planned Rollback
1. **Identify Target**:
   - Check deployment history
   - Verify target deployment
   - Confirm target functionality

2. **Execute Rollback**:
   - Promote target deployment
   - Verify rollback success
   - Test functionality

3. **Monitor**:
   - Watch for issues
   - Monitor performance
   - Check error rates

#### Railway Planned Rollback
1. **Identify Target**:
   - Check deployment history
   - Verify target deployment
   - Confirm target functionality

2. **Execute Rollback**:
   - Redeploy target deployment
   - Verify rollback success
   - Test functionality

3. **Monitor**:
   - Watch for issues
   - Monitor performance
   - Check error rates

---

## Partial Rollback Procedures

### 🔧 P3 Partial Rollback

#### Feature-Specific Rollback
1. **Identify Affected Feature**:
   - [ ] Identify problematic feature
   - [ ] Determine rollback scope
   - [ ] Plan rollback approach
   - [ ] Notify team

2. **Execute Partial Rollback**:
   - [ ] Rollback specific feature
   - [ ] Keep other features active
   - [ ] Verify rollback success
   - [ ] Test remaining functionality

#### Component-Specific Rollback
1. **Identify Affected Component**:
   - [ ] Identify problematic component
   - [ ] Determine rollback scope
   - [ ] Plan rollback approach
   - [ ] Notify team

2. **Execute Component Rollback**:
   - [ ] Rollback specific component
   - [ ] Keep other components active
   - [ ] Verify rollback success
   - [ ] Test remaining functionality

### 🔧 Partial Rollback Methods

#### Frontend Partial Rollback
1. **Feature Flags**:
   - Disable problematic feature
   - Keep other features active
   - Monitor for issues

2. **Component Rollback**:
   - Rollback specific component
   - Keep other components active
   - Monitor for issues

#### Backend Partial Rollback
1. **API Endpoint Rollback**:
   - Rollback specific API endpoint
   - Keep other endpoints active
   - Monitor for issues

2. **Service Rollback**:
   - Rollback specific service
   - Keep other services active
   - Monitor for issues

---

## Database Rollback Procedures

### 🗄️ Database Rollback Overview

#### Rollback Types
- **Migration Rollback**: Revert database migrations
- **Data Rollback**: Restore data from backup
- **Schema Rollback**: Revert schema changes
- **Index Rollback**: Revert index changes

#### Rollback Targets
- **Last Migration**: Revert to last migration
- **Stable Migration**: Revert to stable migration
- **Baseline Migration**: Revert to baseline migration
- **Backup Restore**: Restore from backup

### 🔧 Database Rollback Methods

#### Supabase Migration Rollback
1. **Via Dashboard**:
   - Go to Supabase dashboard
   - Select project
   - Go to Database → Migrations
   - Find target migration
   - Click "Revert"

2. **Via CLI**:
   ```bash
   # List migrations
   supabase migration list
   
   # Revert to specific migration
   supabase db reset --target [MIGRATION_ID]
   ```

3. **Via API**:
   ```bash
   curl -X POST "https://api.supabase.com/v1/projects/[PROJECT_ID]/migrations/revert" \
     -H "Authorization: Bearer $SUPABASE_TOKEN" \
     -d '{"target": "[MIGRATION_ID]"}'
   ```

#### Manual Data Rollback
1. **Backup Current State**:
   - Create backup of current data
   - Verify backup integrity
   - Store backup securely

2. **Restore Previous State**:
   - Restore from previous backup
   - Verify data integrity
   - Test functionality

3. **Validate Rollback**:
   - Check data consistency
   - Test application functionality
   - Monitor for issues

---

## Rollback Validation

### ✅ Rollback Success Criteria

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

### 🔍 Rollback Testing

#### Automated Testing
- [ ] Health check tests pass
- [ ] Integration tests pass
- [ ] Performance tests pass
- [ ] Security tests pass

#### Manual Testing
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

## Post-Rollback Procedures

### 📋 Post-Rollback Checklist

#### Immediate Post-Rollback (< 30 minutes)
- [ ] Verify rollback success
- [ ] Test core functionality
- [ ] Monitor for issues
- [ ] Notify team of completion

#### Short-term Post-Rollback (< 2 hours)
- [ ] Investigate root cause
- [ ] Analyze deployment logs
- [ ] Check service status
- [ ] Document findings

#### Long-term Post-Rollback (< 24 hours)
- [ ] Develop fix for root cause
- [ ] Test fix in staging
- [ ] Prepare re-deployment
- [ ] Plan monitoring improvements

### 🔧 Post-Rollback Actions

#### Root Cause Analysis
1. **Investigate Deployment**:
   - Analyze deployment logs
   - Check service status
   - Review configuration changes
   - Document findings

2. **Identify Root Cause**:
   - Determine what went wrong
   - Analyze contributing factors
   - Document root cause
   - Plan prevention measures

#### Fix Development
1. **Develop Fix**:
   - Create fix for root cause
   - Test fix in staging
   - Verify fix effectiveness
   - Prepare re-deployment

2. **Re-deployment Planning**:
   - Plan re-deployment approach
   - Schedule re-deployment window
   - Prepare monitoring
   - Notify team

#### Process Improvement
1. **Update Procedures**:
   - Update deployment procedures
   - Improve testing processes
   - Enhance monitoring
   - Document lessons learned

2. **Prevention Measures**:
   - Implement additional checks
   - Improve testing coverage
   - Enhance monitoring
   - Train team on improvements

---

## Rollback Tools and Commands

### 🛠️ Rollback Tools

#### Vercel Rollback Tools
```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote [DEPLOYMENT_ID] --prod

# Get deployment details
vercel inspect [DEPLOYMENT_ID]

# Rollback to previous deployment
vercel rollback
```

#### Railway Rollback Tools
```bash
# List deployments
railway status

# Redeploy specific deployment
railway up --detach

# Get deployment logs
railway logs

# Rollback to previous deployment
railway rollback
```

#### Supabase Rollback Tools
```bash
# List migrations
supabase migration list

# Revert to specific migration
supabase db reset --target [MIGRATION_ID]

# Get migration status
supabase migration status

# Rollback last migration
supabase migration rollback
```

### 📊 Rollback Monitoring

#### Health Check Commands
```bash
# Check production health
curl -f https://chef-chopsky-production.up.railway.app/health

# Check staging health
curl -f https://chef-chopsky-staging.up.railway.app/health

# Check frontend health
curl -f https://chef-chopsky-production.vercel.app

# Check staging frontend health
curl -f https://chef-chopsky-git-staging.vercel.app
```

#### Monitoring Commands
```bash
# Check deployment status
gh run list --workflow=production-deployment.yml

# Check workflow logs
gh run view [RUN_ID] --log

# Check service status
railway status

# Check Vercel deployments
vercel ls
```

---

## Rollback Communication

### 📢 Communication Procedures

#### Emergency Rollback Communication
1. **Immediate Notification**:
   - Send emergency alert to team
   - Update stakeholders
   - Document incident
   - Plan investigation

2. **Status Updates**:
   - Provide regular status updates
   - Share rollback progress
   - Communicate resolution timeline
   - Update stakeholders

#### Planned Rollback Communication
1. **Pre-Rollback Notification**:
   - Notify team of planned rollback
   - Explain rollback reason
   - Share rollback timeline
   - Update stakeholders

2. **Post-Rollback Notification**:
   - Notify team of rollback completion
   - Share rollback results
   - Explain next steps
   - Update stakeholders

### 📋 Communication Templates

#### Emergency Rollback Alert
```
🚨 EMERGENCY ROLLBACK INITIATED

Issue: [Issue Description]
Severity: P0 - Critical
Response Time: < 5 minutes
Rollback Target: [Rollback Target]
Status: In Progress

Team: [Team Members]
Stakeholders: [Stakeholders]
Timeline: [Resolution Timeline]

Updates will be provided every 15 minutes.
```

#### Planned Rollback Notification
```
📋 PLANNED ROLLBACK SCHEDULED

Issue: [Issue Description]
Severity: P1 - High
Response Time: < 30 minutes
Rollback Target: [Rollback Target]
Status: Planned

Team: [Team Members]
Stakeholders: [Stakeholders]
Timeline: [Resolution Timeline]

Rollback will begin at [Time].
```

#### Rollback Completion Notification
```
✅ ROLLBACK COMPLETED

Issue: [Issue Description]
Severity: [Severity Level]
Response Time: [Actual Response Time]
Rollback Target: [Rollback Target]
Status: Completed

Team: [Team Members]
Stakeholders: [Stakeholders]
Resolution: [Resolution Summary]

Next Steps: [Next Steps]
```

---

*This runbook should be reviewed and updated regularly to reflect changes in rollback procedures, tools, and team structure.*
