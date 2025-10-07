# Deployment Monitoring Runbook

## Overview
This runbook provides comprehensive guidance for managing deployment monitoring, alerting, and incident response for Chef Chopsky.

## Quick Reference

### 🔔 Alert Channels
- **GitHub Actions**: Built-in workflow notifications
- **Webhook Alerts**: Slack, Discord, or custom webhooks
- **UptimeRobot**: Email/SMS alerts for downtime
- **Sentry**: Error alerts and performance monitoring

### 📊 Monitoring Services
- **Production Frontend**: `https://chef-chopsky-production.vercel.app`
- **Production Agent**: `https://chef-chopsky-production.up.railway.app`
- **Staging Frontend**: `https://chef-chopsky-git-staging.vercel.app`
- **Staging Agent**: `https://chef-chopsky-staging.up.railway.app`

### 🚨 Alert Thresholds
- **Deployment Failure**: Immediate alert
- **Service Down**: 5-minute downtime threshold
- **High Error Rate**: >5% error rate
- **Slow Response**: >3 second response time

## Monitoring Architecture

### 🔄 Monitoring Flow
```
Deployment Trigger
    ↓
GitHub Actions Workflow
    ↓
Health Checks (Every 5 minutes)
    ↓
UptimeRobot Monitoring
    ↓
Sentry Error Tracking
    ↓
Webhook Alerts
    ↓
Incident Response
```

### 📈 Monitoring Levels
1. **Level 1**: Basic health checks and uptime monitoring
2. **Level 2**: Performance monitoring and error tracking
3. **Level 3**: Advanced analytics and trend analysis
4. **Level 4**: Predictive monitoring and capacity planning

## Alert Types and Responses

### 🚀 Deployment Alerts

#### Success Alerts
- **Trigger**: Successful deployment completion
- **Response**: Monitor for any post-deployment issues
- **Action**: Verify functionality and performance

#### Failure Alerts
- **Trigger**: Deployment failure or rollback
- **Response**: Immediate investigation required
- **Action**: 
  1. Check deployment logs
  2. Identify root cause
  3. Fix issue and redeploy
  4. Notify team of resolution

#### Progress Alerts
- **Trigger**: Deployment started or in progress
- **Response**: Monitor deployment progress
- **Action**: Wait for completion and verify success

### 🏥 Health Alerts

#### Service Down
- **Trigger**: Service returns non-200 status code
- **Response**: Immediate investigation required
- **Action**:
  1. Check service logs
  2. Verify infrastructure status
  3. Check for recent deployments
  4. Restart service if needed
  5. Escalate if unresolved

#### Slow Response
- **Trigger**: Response time >3 seconds
- **Response**: Performance investigation
- **Action**:
  1. Check resource usage
  2. Analyze performance metrics
  3. Check for bottlenecks
  4. Optimize if needed

#### High Error Rate
- **Trigger**: Error rate >5%
- **Response**: Error investigation
- **Action**:
  1. Check error logs
  2. Identify error patterns
  3. Fix root cause
  4. Monitor error rate

### 🐛 Error Alerts

#### Critical Errors
- **Trigger**: Application crashes or critical failures
- **Response**: Immediate investigation required
- **Action**:
  1. Check error details in Sentry
  2. Identify affected users
  3. Fix issue immediately
  4. Deploy hotfix if needed

#### Performance Issues
- **Trigger**: Slow database queries or API calls
- **Response**: Performance optimization
- **Action**:
  1. Analyze performance metrics
  2. Identify bottlenecks
  3. Optimize queries or code
  4. Monitor improvements

## Incident Response Procedures

### 🚨 Severity Levels

#### P0 - Critical (Immediate Response)
- **Examples**: Complete service outage, data loss, security breach
- **Response Time**: <15 minutes
- **Escalation**: Immediate notification to all team members
- **Action**: All hands on deck, emergency procedures

#### P1 - High (Urgent Response)
- **Examples**: Major feature broken, significant performance degradation
- **Response Time**: <1 hour
- **Escalation**: Notify team leads and stakeholders
- **Action**: Priority fix, workaround if possible

#### P2 - Medium (Normal Response)
- **Examples**: Minor feature issues, non-critical errors
- **Response Time**: <4 hours
- **Escalation**: Notify development team
- **Action**: Plan fix for next release

#### P3 - Low (Scheduled Response)
- **Examples**: Cosmetic issues, minor improvements
- **Response Time**: <24 hours
- **Escalation**: Add to backlog
- **Action**: Include in next sprint

### 📋 Incident Response Checklist

#### Initial Response (0-15 minutes)
- [ ] Acknowledge alert
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

## Monitoring Dashboard

### 🎯 Key Metrics

#### Deployment Metrics
- **Deployment Success Rate**: Target >95%
- **Deployment Frequency**: Track deployment cadence
- **Deployment Duration**: Average deployment time
- **Rollback Rate**: Percentage of rollbacks

#### Service Metrics
- **Uptime**: Target >99.9%
- **Response Time**: Target <2 seconds
- **Error Rate**: Target <1%
- **Throughput**: Requests per minute

#### Performance Metrics
- **CPU Usage**: Target <70%
- **Memory Usage**: Target <80%
- **Database Performance**: Query response times
- **API Performance**: Endpoint response times

### 📊 Dashboard Setup

#### GitHub Actions Dashboard
- **Workflow Success Rate**: Track deployment success
- **Build Duration**: Monitor build times
- **Test Results**: Track test pass rates
- **Deployment History**: Visual deployment timeline

#### UptimeRobot Dashboard
- **Uptime Charts**: Visual uptime over time
- **Response Time Charts**: Performance trends
- **Incident History**: Track downtime events
- **Monitor Status**: Real-time service status

#### Sentry Dashboard
- **Error Rate Trends**: Track error patterns
- **Performance Metrics**: Response time analysis
- **Release Health**: Error rates per release
- **User Impact**: Affected user counts

## Troubleshooting Guide

### Common Issues

#### "Deployment notifications not working"
1. **Check webhook URL**: Verify webhook is accessible
2. **Check payload format**: Ensure JSON format is correct
3. **Check authentication**: Verify webhook authentication
4. **Test manually**: Send test notification

#### "Health checks failing"
1. **Check service status**: Verify services are running
2. **Check network connectivity**: Ensure services are accessible
3. **Check health endpoints**: Verify health endpoints respond
4. **Check monitoring configuration**: Verify monitor settings

#### "UptimeRobot alerts not working"
1. **Check API key**: Verify API key is correct
2. **Check monitor configuration**: Verify monitor settings
3. **Check alert contacts**: Verify email/SMS settings
4. **Check rate limits**: Ensure not exceeding API limits

#### "Sentry errors not appearing"
1. **Check DSN**: Verify DSN is correct
2. **Check project configuration**: Verify project settings
3. **Check error filtering**: Verify error filtering rules
4. **Check authentication**: Verify auth token

### Debugging Commands

#### Test Health Checks
```bash
# Test production frontend
curl -f https://chef-chopsky-production.vercel.app

# Test production agent
curl -f https://chef-chopsky-production.up.railway.app/health

# Test staging frontend
curl -f https://chef-chopsky-git-staging.vercel.app

# Test staging agent
curl -f https://chef-chopsky-staging.up.railway.app/health
```

#### Test Webhook
```bash
curl -X POST "$ALERT_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test notification from Chef Chopsky"}'
```

#### Test UptimeRobot API
```bash
curl -X POST "https://api.uptimerobot.com/v2/getMonitors" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=$UPTIME_ROBOT_API_KEY&format=json"
```

#### Test Sentry Configuration
```bash
sentry-cli --auth-token $SENTRY_AUTH_TOKEN projects list
```

## Maintenance Procedures

### Daily Tasks
- [ ] Check monitoring dashboard
- [ ] Review overnight alerts
- [ ] Verify all services are healthy
- [ ] Check deployment status

### Weekly Tasks
- [ ] Review alert frequency and content
- [ ] Check monitoring metrics trends
- [ ] Verify all monitors are working
- [ ] Review error patterns and trends

### Monthly Tasks
- [ ] Review and update alert thresholds
- [ ] Check for new monitoring features
- [ ] Review cost and usage
- [ ] Update monitoring documentation

### Quarterly Tasks
- [ ] Evaluate monitoring tools and alternatives
- [ ] Review and update alert procedures
- [ ] Conduct monitoring system audit
- [ ] Plan for scaling monitoring as needed

## Cost Management

### Free Tier Limits
- **UptimeRobot**: 50 monitors, 5-minute intervals
- **Sentry**: 5,000 errors/month, 1 project
- **GitHub Actions**: 2,000 minutes/month
- **Webhooks**: Usually free

### Cost Optimization
- **Monitor Intervals**: Use 5-10 minute intervals
- **Error Filtering**: Filter out non-critical errors
- **Alert Frequency**: Limit alert frequency to avoid spam
- **Resource Usage**: Monitor GitHub Actions usage

### Estimated Monthly Cost
- **UptimeRobot**: Free (50 monitors)
- **Sentry**: Free (5,000 errors/month)
- **GitHub Actions**: Free (2,000 minutes/month)
- **Total**: $0/month (within free tiers)

## Security Considerations

### Alert Security
- **Webhook URLs**: Keep webhook URLs secure
- **API Keys**: Rotate API keys regularly
- **Access Control**: Limit access to monitoring systems
- **Data Privacy**: Ensure monitoring data is secure

### Incident Security
- **Communication**: Use secure channels for incident communication
- **Documentation**: Secure incident documentation
- **Access Logs**: Monitor access to monitoring systems
- **Audit Trails**: Maintain audit trails for all actions

## Best Practices

### Monitoring Best Practices
- **Set Appropriate Thresholds**: Not too sensitive, not too lenient
- **Use Multiple Channels**: Don't rely on single alert channel
- **Regular Testing**: Test alerts and procedures regularly
- **Document Everything**: Document all procedures and changes

### Incident Response Best Practices
- **Clear Communication**: Communicate clearly and frequently
- **Document Everything**: Document all actions and decisions
- **Learn from Incidents**: Conduct post-mortems and learn
- **Continuous Improvement**: Continuously improve procedures

### Team Collaboration
- **Clear Roles**: Define clear roles and responsibilities
- **Regular Training**: Train team on procedures
- **Knowledge Sharing**: Share knowledge and lessons learned
- **Continuous Learning**: Continuously learn and improve

---

*This runbook should be reviewed and updated regularly to reflect changes in monitoring systems and procedures.*
