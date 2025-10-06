# Environment Workflow and Testing Strategy

## Environment Overview

Our application uses a multi-environment approach to ensure safe, reliable deployments. Think of it like a restaurant kitchen workflow:

### 🏠 **Development** (Your Computer)
- **Purpose:** Active development and immediate feedback
- **Data:** Local database, test API keys, mock data
- **Testing:** Unit tests, integration tests, hot reloading
- **Goal:** Fast iteration and bug catching during development

### 🎯 **Preview Deployments** (Vercel PRs - Free)
- **Purpose:** Test specific features/changes in isolation
- **Data:** Test APIs with test data
- **Testing:** E2E tests, visual regression testing
- **Goal:** Catch bugs before merging code
- **URL Pattern:** `myapp-git-feature-branch.vercel.app`

### 🧪 **Staging** (Separate Vercel Project - Free)
- **Purpose:** Test the complete system with production-like data
- **Data:** Production-like data, staging API keys
- **Testing:** Smoke tests, performance tests, user acceptance testing
- **Goal:** Ensure system stability before production deployment
- **URL:** `chef-chopsky-staging.vercel.app`

### 🏪 **Production** (Main Vercel Project)
- **Purpose:** Live application serving real users
- **Data:** Real user data, production API keys
- **Testing:** Health checks, monitoring, alerting
- **Goal:** Maintain uptime and catch production issues quickly
- **URL:** `chef-chopsky.vercel.app`

## Testing Strategy by Environment

### Development Testing
- **Unit Tests:** Test individual functions/components
- **Integration Tests:** Test how parts work together
- **Run Frequency:** Every file save (fast feedback)
- **Tools:** Jest, React Testing Library
- **Mock Strategy:** Mock external services for speed

### Preview Testing
- **E2E Tests:** Test complete user journeys
- **Visual Regression:** Ensure UI consistency
- **Run Frequency:** On every PR (before merging)
- **Tools:** Playwright
- **Data Strategy:** Test APIs with test data

### Staging Testing
- **Smoke Tests:** Basic functionality verification
- **Performance Tests:** Load testing, speed checks
- **User Acceptance:** Stakeholder testing
- **Run Frequency:** After each staging deployment
- **Tools:** Playwright, Lighthouse
- **Data Strategy:** Production-like data

### Production Testing
- **Health Checks:** Application responsiveness
- **Monitoring:** Error tracking, performance monitoring
- **Run Frequency:** Continuous monitoring
- **Tools:** Vercel Analytics, Sentry, custom health endpoints
- **Strategy:** Minimal testing, focus on monitoring

## Deployment Workflow

```
Code Change → Unit Tests → Preview Deploy → E2E Tests → Merge → Staging Deploy → Smoke Tests → Production Deploy → Monitor
```

### Step-by-Step Process

1. **Development:** Write code and run unit tests locally
2. **Preview:** Create PR → Vercel auto-deploys preview → Run E2E tests
3. **Merge:** After tests pass, merge to main branch
4. **Staging:** Deploy to staging project → Run smoke tests
5. **Production:** Deploy to production → Monitor for issues

## Environment-Specific Configuration

### Development
- Fast tests (unit tests)
- Mock external services
- Hot reloading for quick iteration
- Local database

### Preview
- Full E2E tests
- Test against real APIs (with test data)
- Visual regression testing
- Temporary URLs

### Staging
- Production-like data
- Performance testing
- User acceptance testing
- Security scanning
- Staging-specific environment variables

### Production
- Minimal testing (just health checks)
- Focus on monitoring and alerting
- Rollback capabilities
- Production environment variables

## Cost-Effective Approach

Instead of using Vercel Pro ($30/month) for pre-production environments, we use:

- **Free Vercel Preview Deployments** for feature testing
- **Separate Vercel Project** for staging (free tier)
- **Railway** as backup staging option if needed

This approach provides the same benefits at no additional cost.

## Key Benefits

1. **Risk Mitigation:** Bugs caught before reaching production
2. **Quality Assurance:** Multiple testing layers ensure reliability
3. **Stakeholder Confidence:** Safe environment for demos and testing
4. **Cost Effective:** Uses free tiers effectively
5. **Scalable:** Easy to add more environments as needed

## Monitoring and Alerts

- **Development:** Console logs and test results
- **Preview:** PR status checks and test reports
- **Staging:** Deployment notifications and smoke test results
- **Production:** Error tracking, performance monitoring, uptime alerts
