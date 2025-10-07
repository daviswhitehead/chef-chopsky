# Roadmap: Deployment & Environment Management

## Project Overview
**Project**: Chef Chopsky v6 Deployment & Environment Management  
**Timeline**: 1 week (7 days)  
**Budget**: <$50/month hosting costs  
**Target**: Solo-entrepreneur optimized deployment strategy  

## Current State Analysis

### Existing Infrastructure
- ✅ **Frontend**: Next.js 15.5.3 with TypeScript
- ✅ **Backend**: Node.js agent service with Express
- ✅ **Database**: Supabase integration with migrations
- ✅ **Testing**: Comprehensive test suite (unit, integration, E2E)
- ✅ **CI/CD**: GitHub Actions workflows for testing
- ✅ **Health Monitoring**: Service health check scripts
- ✅ **Environment Setup**: Automated setup scripts

### Current Gaps
- ❌ **Production Deployment**: No public URL
- ❌ **Environment Management**: No staging environment
- ❌ **Production CI/CD**: No automated production deployment
- ❌ **Monitoring**: No uptime monitoring
- ❌ **Error Tracking**: No production error monitoring

## Phase Breakdown

### 🚀 Phase 1: MVP Production Deployment (Day 1)
**Objective**: Get the application live and accessible to users  
**Duration**: 4-6 hours  
**Priority**: Critical  

#### Deliverables
1. **Production Vercel Deployment**
   - Deploy frontend to Vercel
   - Configure production environment variables
   - Set up custom domain (optional)
   - Verify all core features work

2. **Production Supabase Database**
   - Create production Supabase project
   - Deploy database schema
   - Configure production environment variables
   - Set up database backups

3. **Basic Uptime Monitoring**
   - Configure UptimeRobot
   - Set up email alerts for downtime
   - Monitor key endpoints

#### Success Criteria
- [ ] Application accessible at public URL
- [ ] All core features functional in production
- [ ] Application loads within 3 seconds
- [ ] Basic uptime monitoring active
- [ ] No critical errors in production logs

#### Resource Allocation
- **Human Tasks**: Vercel account setup, Supabase project creation, monitoring configuration
- **AI Tasks**: Step-by-step deployment guidance, configuration file generation, troubleshooting
- **Time Estimate**: 4-6 hours

---

### 🏗️ Phase 2: Environment Management & CI/CD (Days 2-5)
**Objective**: Establish proper environment separation and automated deployment  
**Duration**: 8-12 hours over 4 days  
**Priority**: High  

#### Deliverables
1. **Staging Environment Setup**
   - Create staging Vercel deployment
   - Set up staging Supabase project
   - Configure staging environment variables
   - Implement access control (password protection)

2. **Automated Production Deployment**
   - Create GitHub Actions workflow for production
   - Configure automatic deployment on main branch
   - Set up deployment notifications
   - Implement rollback capability

3. **Environment Configuration Management**
   - Create environment-specific configuration files
   - Implement clear naming conventions
   - Document environment variables
   - Set up configuration validation

4. **Retriever & Embeddings Configuration (Env-Driven)**
   - Introduce env vars: `RETRIEVER_PROVIDER`, `EMBEDDING_MODEL`
   - Per-env vector index/namespace: `LANGCHAIN_INDEX_NAME` (Elastic/Pinecone), `MONGO_NAMESPACE_PREFIX` (MongoDB)
   - Add environment discriminator to documents/filters (e.g., `env=local|staging|production`)
   - Default guidance: Local `memory`, Staging `pinecone`, Production `pinecone`/`elastic`/`mongodb`

#### Success Criteria
- [ ] Staging environment accessible and functional
- [ ] Automated production deployment working
- [ ] Clear environment separation maintained
- [ ] Configuration management documented
- [ ] Deployment notifications active
- [ ] Retriever provider and embedding model configurable via env per environment
- [ ] No cross-environment data bleed (validated by filters and per-env index names)

#### Resource Allocation
- **Human Tasks**: Environment setup, GitHub Actions configuration, access control setup
- **AI Tasks**: Workflow generation, configuration templates, documentation creation
- **Time Estimate**: 8-12 hours over 4 days

---

### 🔧 Phase 3: Advanced Monitoring & Documentation (Days 6-7)
**Objective**: Complete the deployment system with monitoring and documentation  
**Duration**: 4-6 hours over 2 days  
**Priority**: Medium  

#### Deliverables
1. **Staging Deployment Pipeline**
   - Create GitHub Actions workflow for staging
   - Configure automatic deployment on feature branches
   - Set up staging environment cleanup
   - Integrate with pull request process

2. **Error Monitoring**
   - Configure Sentry for error tracking
   - Set up error alerts
   - Implement performance monitoring
   - Create error resolution workflow

3. **Maintenance Documentation**
   - Create setup instructions
   - Document maintenance procedures
   - Create troubleshooting guide
   - Document cost monitoring and optimization

#### Success Criteria
- [ ] Staging deployment pipeline functional
- [ ] Error monitoring active
- [ ] Performance monitoring configured
- [ ] Complete documentation available
- [ ] Maintenance procedures documented

#### Resource Allocation
- **Human Tasks**: Sentry setup, documentation creation, monitoring configuration
- **AI Tasks**: Documentation generation, monitoring setup guidance, troubleshooting guides
- **Time Estimate**: 4-6 hours over 2 days

## Backlog (Future)

### Auth + User-Scoped Retrieval (separate project)
- [ ] 5.1 Supabase Auth integration (JWT) and user context to agent
- [ ] 5.2 Supabase RLS policies for user-scoped documents (pantry, notes)
- [ ] 5.3 Pinecone metadata schema `{ user_id, org_id?, env, doc_id, type }`
- [ ] 5.4 Sync worker: Supabase → Pinecone upsert/delete with retries
- [ ] 5.5 Post-retrieval authorization check against Supabase before returning data
- [ ] 5.6 E2E tests for user isolation

### Local Supabase via CLI
- [ ] 6.1 Adopt Supabase CLI for local development database (Docker-based)
- [ ] 6.2 Add `npm run supabase:start`/`supabase:stop` scripts and docs
- [ ] 6.3 Create `frontend/.env.local.example` pointing to local Supabase URL/anon key
- [ ] 6.4 Migrations flow: `npx supabase db reset` for local; `db push` for staging/prod
- [ ] 6.5 Document environment mapping: Local (CLI) | Staging (hosted `chef-chopsky-staging`) | Production (hosted `chef-chopsky`)
- [ ] 6.6 Add note: the previous `chef-chopsky-local` hosted project has been repurposed as the staging project to stay within free tier limits

## Dependency Mapping

### Critical Path Dependencies
```
Phase 1.1 (Production Deployment) → Phase 1.2 (Production Database) → Phase 2.1 (Staging Environment) → Phase 2.2 (CI/CD) → Phase 3.1 (Staging Pipeline)
```

### Parallel Work Opportunities
- **Phase 1.3** (Basic Monitoring) can run parallel with Phase 1.2
- **Phase 2.3** (Environment Configuration) can run parallel with Phase 2.1
- **Phase 3.2** (Error Monitoring) can run parallel with Phase 3.1

### External Dependencies
- **Vercel Account**: Required for hosting
- **Supabase Projects**: Required for database
- **GitHub Actions**: Required for CI/CD
- **Monitoring Services**: UptimeRobot, Sentry
 - **Vector Store** (if not memory): Elastic/Pinecone/MongoDB access per environment

## Risk Assessment & Mitigation

### High-Risk Items
1. **Budget Overrun** (Medium Probability, High Impact)
   - *Mitigation*: Start with free tiers, monitor usage, set cost alerts
   - *Contingency*: Reduce hosting tier or features if needed

2. **Deployment Complexity** (Medium Probability, High Impact)
   - *Mitigation*: Use managed services, follow proven patterns
   - *Contingency*: Manual deployment process as backup

3. **Environment Confusion** (Low Probability, High Impact)
   - *Mitigation*: Clear naming conventions, separate configurations
   - *Contingency*: Documentation and checklists for environment management

### Medium-Risk Items
1. **Maintenance Overhead** (Medium Probability, Medium Impact)
   - *Mitigation*: Automate everything possible, use managed services
   - *Contingency*: Accept higher maintenance time initially

2. **Security Vulnerabilities** (Low Probability, Medium Impact)
   - *Mitigation*: Use managed services, keep dependencies updated
   - *Contingency*: Regular security audits and updates

## Resource Allocation Strategy

### Human vs AI Task Distribution

#### Human Tasks (Strategic & Creative)
- **Architecture Decisions**: Environment strategy, hosting selection
- **Account Setup**: Vercel, Supabase, monitoring services
- **Security Configuration**: Access controls, environment variables
- **Documentation Review**: Final review and approval
- **Quality Assurance**: Testing and validation

#### AI Tasks (Implementation & Guidance)
- **Step-by-Step Guidance**: Deployment procedures, configuration
- **Configuration Generation**: Environment files, GitHub Actions workflows
- **Troubleshooting**: Problem diagnosis and resolution
- **Best Practices**: Recommendations and optimization
- **Documentation Creation**: Setup guides, troubleshooting docs

### Skill Requirements
- **Basic Deployment Knowledge**: Vercel, GitHub Actions
- **Environment Management**: Understanding of staging vs production
- **Monitoring Setup**: UptimeRobot, Sentry configuration
- **Documentation**: Clear, actionable documentation creation

### Timeline Estimates
- **Phase 1**: 4-6 hours (Day 1)
- **Phase 2**: 8-12 hours over 4 days (Days 2-5)
- **Phase 3**: 4-6 hours over 2 days (Days 6-7)
- **Total**: 16-24 hours over 7 days

## Success Metrics

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

## Quality Gates

### Phase 1 Quality Gates
- [ ] Production deployment successful
- [ ] All core features functional
- [ ] Basic monitoring active
- [ ] No critical errors

### Phase 2 Quality Gates
- [ ] Staging environment functional
- [ ] Automated deployment working
- [ ] Environment separation maintained
- [ ] Configuration documented

### Phase 3 Quality Gates
- [ ] Staging pipeline functional
- [ ] Error monitoring active
- [ ] Documentation complete
- [ ] Maintenance procedures documented

## Next Steps

### Immediate Actions (Day 1)
1. **Review and approve this roadmap**
2. **Set up Vercel account** (if not already done)
3. **Create production Supabase project**
4. **Begin Phase 1 implementation**

### Preparation for Phase 2
1. **Review GitHub Actions workflows**
2. **Plan staging environment strategy**
3. **Prepare environment configuration templates**
4. **Set up monitoring service accounts**

### Preparation for Phase 3
1. **Plan error monitoring strategy**
2. **Prepare documentation templates**
3. **Plan maintenance procedures**
4. **Set up cost monitoring**

## Future: Auth + User-Scoped Retrieval (Separate Project)

This is not in scope for v6 and will be planned separately. High-level notes for future implementation:

### Architecture Overview
- **Auth**: Supabase Auth (JWT). Frontend sends authenticated requests; agent receives `user_id`/`org_id` context.
- **Source of Truth**: Supabase tables (e.g., `documents`, `pantry_items`) with RLS policies keyed by `user_id`/`org_id`.
- **Vector Search**: Pinecone as embedding store only; vectors include metadata `{ user_id, org_id?, env, doc_id, type }`.
- **Sync**: Background worker listens to Supabase changes and upserts/deletes vectors in Pinecone.
- **Query Flow**: Agent filters Pinecone by `user_id` (and `org_id`) + `env`, then re-validates access in Supabase before returning data.

### Security & Isolation
- Per-environment indexes/namespaces in Pinecone; always include `env` metadata and filter.
- Enforce RLS in Supabase for all document access; treat Pinecone results as candidates only.
- Support deletion/erasure by removing vectors on Supabase delete.

### Suggested Deliverables (Future Phase)
- Supabase schema and RLS policies for user-scoped docs (pantry, notes, uploads).
- Pinecone metadata schema and filter contract; index/namespace per env.
- Embedding sync service (insert/update/delete) with retries and observability.
- Agent changes to enforce auth context and post-retrieval authorization checks.
- E2E tests for user isolation and access control.

### Acceptance Criteria (Future)
- [ ] Authenticated users only access their own documents via the agent.
- [ ] Cross-user and cross-environment data isolation verified by tests.
- [ ] Deletions in Supabase remove associated vectors within SLA.
- [ ] Observability dashboards for sync health and mismatch detection.

## Assumptions and Constraints

### Technical Assumptions
- Vercel is suitable for hosting (Next.js optimized)
- Supabase free tier sufficient for MVP
- GitHub Actions sufficient for CI/CD
- Current test suite provides adequate coverage

### Business Constraints
- Solo entrepreneur with limited time
- Budget constraint of <$50/month
- Need for minimal maintenance overhead
- Timeline pressure for v1 deployment

### Success Dependencies
- Reliable internet connection
- Access to required service accounts
- Basic deployment knowledge
- Willingness to learn new tools

## Contingency Plans

### Plan A: Budget Overrun
1. **Immediate**: Reduce hosting tier or features
2. **Short-term**: Optimize resource usage
3. **Long-term**: Consider alternative hosting options
4. **Fallback**: Return to local development only

### Plan B: Deployment Failure
1. **Immediate**: Manual deployment process
2. **Short-term**: Fix CI/CD pipeline issues
3. **Long-term**: Improve deployment reliability
4. **Fallback**: Use simpler deployment method

### Plan C: Maintenance Overhead
1. **Immediate**: Reduce monitoring and automation
2. **Short-term**: Optimize existing processes
3. **Long-term**: Hire help or use more managed services
4. **Fallback**: Accept higher maintenance time

## Communication Plan

### Progress Updates
- **Daily**: Progress updates and blockers
- **Weekly**: Comprehensive status review
- **Milestone**: Phase completion celebrations
- **Ad-hoc**: Issue escalation and resolution

### Documentation Updates
- **Real-time**: Progress tracking and notes
- **Phase-end**: Phase completion documentation
- **Project-end**: Final project documentation
- **Ongoing**: Maintenance and troubleshooting updates

---

*This roadmap provides a comprehensive plan for implementing deployment and environment management for Chef Chopsky, optimized for solo entrepreneur constraints while maintaining professional standards.*
