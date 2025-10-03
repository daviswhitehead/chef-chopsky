# v6: Deployment & Environment Management

This project implements deployment and environment management for Chef Chopsky, establishing a professional but solo-entrepreneur-friendly deployment strategy.

## Project Overview

**Goal**: Deploy Chef Chopsky to a public website with proper environment management, CI/CD, and monitoring - all optimized for a solo entrepreneur's constraints.

**Timeline**: v1 deployment within 1 day, full setup within 1 week

**Budget**: <$50/month hosting costs

## Project Structure

### Core Documentation
- **`intent.md`** - Project intent and problem definition
- **`user-stories.md`** - Detailed user stories and acceptance criteria
- **`risks-and-mitigation.md`** - Risk assessment and mitigation strategies
- **`README.md`** - This overview document

### Implementation Phases

#### 🚀 Phase 1: MVP Deployment (Day 1)
- Production deployment to Vercel
- Production Supabase database setup
- Basic uptime monitoring

#### 🏗️ Phase 2: Environment Management (Week 1)
- Staging environment setup
- Automated production deployment
- Environment configuration management

#### 🔧 Phase 3: Advanced Features (Week 2)
- Staging deployment pipeline
- Error monitoring
- Maintenance documentation

## Environment Strategy

### 3-Environment Architecture
1. **Local Development** - Current setup for active development
2. **Staging Environment** - Private URL for testing changes
3. **Production Environment** - Public URL for users

### Technology Stack
- **Frontend Hosting**: Vercel (recommended for Next.js)
- **Backend Hosting**: Railway (for agent service deployment)
- **Database**: Supabase (separate projects per environment)
- **CI/CD**: GitHub Actions
- **Monitoring**: UptimeRobot + Sentry
- **Cost**: <$50/month total
- **Vector Store**: Memory (local), Elastic/Pinecone/MongoDB (staging/prod)

## Key User Stories

### Epic 1: Production Deployment
- Deploy application to public URL
- Set up production database
- Implement basic monitoring

### Epic 2: Environment Management
- Create staging environment
- Manage environment configurations
- Establish clear separation

### Epic 3: CI/CD Pipeline
- Automate production deployments
- Set up staging deployment pipeline
- Implement deployment monitoring

### Epic 4: Monitoring & Maintenance
- Uptime monitoring
- Error tracking
- Maintenance documentation

## Success Criteria

### Primary Metrics
- [ ] **Uptime**: 99%+ availability
- [ ] **Deployment Speed**: v1 within 1 day
- [ ] **Management Simplicity**: <30 minutes weekly maintenance
- [ ] **User Access**: Friends can access and use application

### Secondary Metrics
- [ ] **Cost Efficiency**: <$50/month hosting
- [ ] **Deployment Reliability**: 95%+ successful deployments
- [ ] **Environment Isolation**: Clear separation between environments
- [ ] **Monitoring Coverage**: Basic uptime and error monitoring

## Risk Management

### High-Risk Items
- **Budget Overrun**: Mitigate with free tiers and cost monitoring
- **Deployment Complexity**: Use managed services and proven patterns
- **Environment Confusion**: Clear naming and separate configurations

### Medium-Risk Items
- **Maintenance Overhead**: Automate everything possible
- **Security Vulnerabilities**: Use managed services and best practices
- **Performance Issues**: Monitor and optimize proactively

## Key Decisions

### Agent Hosting Platform: Railway
**Decision**: Use Railway for agent service deployment instead of Vercel or other platforms.

**Reasoning**:
- **Vercel Limitations**: Optimized for static/JAMstack, not persistent backend services
- **Railway Benefits**: Designed for Node.js backends, better process management, simpler CI/CD
- **Cost Efficiency**: Railway free tier generous for MVP, straightforward pricing scaling
- **Environment Management**: Clean separation of concerns (Vercel = frontend, Railway = backend)

**Alternatives Considered**:
- Vercel Functions: Would require restructuring agent as serverless functions, complexity not justified for MVP
- Fly.io: Excellent platform but higher learning curve and cost
- Heroku: Market leader but expensive for small projects
- Self-hosted: Too much operational overhead for solo entrepreneur

**Impact**: Frontend communicates with agent at `https://{project}-production.up.railway.app`

## Implementation Approach

### Solo-Entrepreneur Optimized
- **Simplicity**: Use managed services to reduce complexity
- **Cost-Effective**: Start with free tiers, scale as needed
- **Low Maintenance**: Automate everything possible
- **Clear Documentation**: Easy to understand and maintain

### Best Practices Balanced
- **Professional Standards**: Proper environment separation
- **CI/CD**: Automated deployment and testing
- **Monitoring**: Uptime and error tracking
- **Security**: Basic security best practices
 - **Retrieval Isolation**: Per-env retriever provider, index/namespace, and filters

## Next Steps

1. **Review Intent Document** - Validate problem definition and approach
2. **Approve User Stories** - Confirm scope and priorities
3. **Risk Assessment** - Review and approve mitigation strategies
4. **Proceed to Roadmap** - Create detailed implementation plan

## Environment Variables (Retriever & Embeddings)

Add these env vars during Phase 2 to make the retriever and embeddings environment-configurable:

- `RETRIEVER_PROVIDER` (local: `memory`; staging: `elastic-local` or shared dev; prod: `elastic`/`pinecone`/`mongodb`)
- `EMBEDDING_MODEL` (e.g., `openai/text-embedding-3-small`, `openai/text-embedding-3-large`, or `cohere/<model>`)
- `LANGCHAIN_INDEX_NAME` (Elastic/Pinecone) per environment, e.g., `chef-chopsky-${NODE_ENV}`
- `MONGO_NAMESPACE_PREFIX` (MongoDB) to namespace collections per environment
- Add an `env` discriminator (`local|staging|production`) to vector docs and include it in filters

## Agent Deployment Configuration

Agent service deploys to Railway with production environment variables:
- Railway auto-sets `PORT` and `RAILWAY_STATIC_URL` 
- Agent connects to production Supabase using Railway env vars
- Frontend references agent via Railway URL in production

## AI Collaboration

**AI's Role**:
- Architecture design and recommendations
- Step-by-step implementation guidance
- Best practices for solo entrepreneurs
- Troubleshooting and problem resolution

**Context for AI**:
- Focus on practical, implementable solutions
- Prioritize simplicity over complexity
- Consider solo entrepreneur constraints
- Balance best practices with feasibility

---

*This project follows the AI Development Playbook and is ready to proceed to the Roadmap Creation phase.*
