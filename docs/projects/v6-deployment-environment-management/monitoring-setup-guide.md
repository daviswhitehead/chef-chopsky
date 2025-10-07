# Deployment Monitoring & Alerting Setup Guide

## Overview
This guide walks through setting up comprehensive monitoring and alerting for Chef Chopsky deployment pipelines, including uptime monitoring, error tracking, and deployment notifications.

## Monitoring Architecture

### 🔔 Notification Channels
- **GitHub Actions**: Built-in workflow notifications
- **Webhook Alerts**: Slack, Discord, or custom webhooks
- **UptimeRobot**: External uptime monitoring
- **Sentry**: Error tracking and performance monitoring

### 📊 Monitoring Levels
1. **Deployment Monitoring**: Track CI/CD pipeline success/failure
2. **Health Monitoring**: Monitor service availability and response times
3. **Uptime Monitoring**: External monitoring of public URLs
4. **Error Monitoring**: Track and alert on application errors

## Required GitHub Secrets

### 🔐 Alert Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `ALERT_WEBHOOK_URL` | Webhook URL for notifications | 1. Create webhook in Slack/Discord<br>2. Copy webhook URL<br>3. Add to GitHub secrets |

### 🏥 UptimeRobot Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `UPTIME_ROBOT_API_KEY` | UptimeRobot API key | 1. Go to [uptimerobot.com](https://uptimerobot.com)<br>2. Account → My Settings → API Settings<br>3. Copy API key |
| `UPTIME_ROBOT_PROD_FRONTEND_ID` | Production frontend monitor ID | 1. Create monitor in UptimeRobot<br>2. Copy monitor ID from URL |
| `UPTIME_ROBOT_PROD_AGENT_ID` | Production agent monitor ID | 1. Create monitor in UptimeRobot<br>2. Copy monitor ID from URL |
| `UPTIME_ROBOT_STAGING_FRONTEND_ID` | Staging frontend monitor ID | 1. Create monitor in UptimeRobot<br>2. Copy monitor ID from URL |
| `UPTIME_ROBOT_STAGING_AGENT_ID` | Staging agent monitor ID | 1. Create monitor in UptimeRobot<br>2. Copy monitor ID from URL |

### 🐛 Sentry Configuration
| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `SENTRY_DSN` | Sentry DSN for error tracking | 1. Go to [sentry.io](https://sentry.io)<br>2. Create project<br>3. Copy DSN from project settings |
| `SENTRY_AUTH_TOKEN` | Sentry authentication token | 1. Go to Sentry → Settings → Auth Tokens<br>2. Create new token<br>3. Copy token |

## Step-by-Step Setup

### 1. Configure Webhook Alerts

#### 1.1 Slack Integration
1. Go to your Slack workspace
2. Create a new app or use existing one
3. Go to "Incoming Webhooks" → "Add New Webhook"
4. Choose channel for deployment notifications
5. Copy webhook URL
6. Add to GitHub secrets as `ALERT_WEBHOOK_URL`

#### 1.2 Discord Integration
1. Go to your Discord server
2. Server Settings → Integrations → Webhooks
3. Create new webhook
4. Copy webhook URL
5. Add to GitHub secrets as `ALERT_WEBHOOK_URL`

#### 1.3 Custom Webhook
1. Create webhook endpoint in your application
2. Ensure it accepts POST requests with JSON payload
3. Add webhook URL to GitHub secrets as `ALERT_WEBHOOK_URL`

### 2. Set Up UptimeRobot Monitoring

#### 2.1 Create UptimeRobot Account
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account
3. Verify email address

#### 2.2 Create Monitors
Create monitors for each service:

**Production Frontend Monitor:**
- **Monitor Type**: HTTP(s)
- **URL**: `https://chef-chopsky-production.vercel.app`
- **Monitor Interval**: 5 minutes
- **Alert Contacts**: Add your email
- **Monitor Name**: "Chef Chopsky Production Frontend"

**Production Agent Monitor:**
- **Monitor Type**: HTTP(s)
- **URL**: `https://chef-chopsky-production.up.railway.app/health`
- **Monitor Interval**: 5 minutes
- **Alert Contacts**: Add your email
- **Monitor Name**: "Chef Chopsky Production Agent"

**Staging Frontend Monitor:**
- **Monitor Type**: HTTP(s)
- **URL**: `https://chef-chopsky-git-staging.vercel.app`
- **Monitor Interval**: 10 minutes
- **Alert Contacts**: Add your email
- **Monitor Name**: "Chef Chopsky Staging Frontend"

**Staging Agent Monitor:**
- **Monitor Type**: HTTP(s)
- **URL**: `https://chef-chopsky-staging.up.railway.app/health`
- **Monitor Interval**: 10 minutes
- **Alert Contacts**: Add your email
- **Monitor Name**: "Chef Chopsky Staging Agent"

#### 2.3 Get Monitor IDs
1. Go to "My Monitors" in UptimeRobot
2. Click on each monitor
3. Copy the monitor ID from the URL (e.g., `1234567890`)
4. Add each ID to GitHub secrets

#### 2.4 Get API Key
1. Go to "My Settings" → "API Settings"
2. Copy your API key
3. Add to GitHub secrets as `UPTIME_ROBOT_API_KEY`

### 3. Set Up Sentry Error Monitoring

#### 3.1 Create Sentry Account
1. Go to [sentry.io](https://sentry.io)
2. Sign up for free account
3. Create new organization: "chef-chopsky"

#### 3.2 Create Projects
Create separate projects for each environment:

**Production Project:**
- **Project Name**: "chef-chopsky-production"
- **Platform**: Node.js
- **Team**: Add yourself

**Staging Project:**
- **Project Name**: "chef-chopsky-staging"
- **Platform**: Node.js
- **Team**: Add yourself

#### 3.3 Get DSN and Auth Token
1. Go to project settings
2. Copy DSN from "Client Keys (DSN)"
3. Add to GitHub secrets as `SENTRY_DSN`
4. Go to "Auth Tokens" → "Create New Token"
5. Copy token and add to GitHub secrets as `SENTRY_AUTH_TOKEN`

### 4. Configure GitHub Secrets

Add all the secrets to your GitHub repository:

1. Go to repository → Settings → Secrets and variables → Actions
2. Add each secret:
   - `ALERT_WEBHOOK_URL`
   - `UPTIME_ROBOT_API_KEY`
   - `UPTIME_ROBOT_PROD_FRONTEND_ID`
   - `UPTIME_ROBOT_PROD_AGENT_ID`
   - `UPTIME_ROBOT_STAGING_FRONTEND_ID`
   - `UPTIME_ROBOT_STAGING_AGENT_ID`
   - `SENTRY_DSN`
   - `SENTRY_AUTH_TOKEN`

## Monitoring Features

### 🔔 Deployment Notifications
- **Success Alerts**: Notify when deployments complete successfully
- **Failure Alerts**: Notify when deployments fail
- **Progress Updates**: Notify when deployments start
- **Rich Information**: Include URLs, branch info, and workflow links

### 🏥 Health Monitoring
- **Automated Health Checks**: Every 5 minutes
- **Response Time Tracking**: Monitor service performance
- **Status Code Monitoring**: Track HTTP response codes
- **Service Health Validation**: Verify health endpoint responses

### 📊 Uptime Monitoring
- **External Monitoring**: Independent uptime tracking
- **Email Alerts**: Notify on downtime
- **Historical Data**: Track uptime statistics
- **Multiple Check Points**: Monitor from different locations

### 🐛 Error Monitoring
- **Error Tracking**: Capture and track application errors
- **Performance Monitoring**: Track response times and performance
- **Release Tracking**: Associate errors with deployments
- **Alert Configuration**: Notify on critical errors

## Alert Configuration

### 📧 Email Alerts
Configure email alerts in each service:
- **UptimeRobot**: Email notifications for downtime
- **Sentry**: Email notifications for critical errors
- **GitHub**: Email notifications for workflow failures

### 💬 Webhook Alerts
Configure webhook alerts for real-time notifications:
- **Slack**: Channel notifications for deployments
- **Discord**: Server notifications for deployments
- **Custom**: Application-specific notifications

### 📱 Mobile Alerts
Set up mobile notifications:
- **UptimeRobot**: SMS alerts for critical downtime
- **Sentry**: Mobile app notifications
- **GitHub**: Mobile app notifications

## Monitoring Dashboard

### 🎯 Key Metrics to Track
- **Deployment Success Rate**: Percentage of successful deployments
- **Uptime Percentage**: Service availability over time
- **Response Time**: Average response time for services
- **Error Rate**: Number of errors per deployment
- **Deployment Frequency**: How often deployments occur

### 📈 Dashboard Setup
Create monitoring dashboards in each service:
- **UptimeRobot**: Uptime and response time charts
- **Sentry**: Error rate and performance charts
- **GitHub**: Deployment success rate charts

## Troubleshooting

### Common Issues

#### "Webhook notifications not working"
- Verify webhook URL is correct
- Check webhook endpoint is accessible
- Verify JSON payload format
- Test webhook manually

#### "UptimeRobot monitors not updating"
- Verify API key is correct
- Check monitor IDs are correct
- Verify URLs are accessible
- Check API rate limits

#### "Sentry errors not appearing"
- Verify DSN is correct
- Check Sentry project configuration
- Verify authentication token
- Check error filtering settings

### Debugging Commands

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

## Next Steps

After setting up monitoring:
1. **Test All Alerts**: Verify notifications work correctly
2. **Configure Thresholds**: Set appropriate alert thresholds
3. **Create Runbooks**: Document response procedures
4. **Train Team**: Ensure team knows how to respond to alerts
5. **Review Metrics**: Regularly review monitoring metrics
6. **Optimize Alerts**: Adjust alert frequency and content

## Maintenance

### Weekly Tasks
- [ ] Review alert frequency and content
- [ ] Check monitoring dashboard metrics
- [ ] Verify all monitors are working
- [ ] Review error trends and patterns

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

---

*This monitoring setup provides comprehensive coverage of deployment pipelines and service health, ensuring quick detection and response to issues.*
