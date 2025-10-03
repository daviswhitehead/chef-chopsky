# v6 Deployment & Environment Management — Task Decomposition

This file tracks end-to-end tasks across all phases for the v6 project. Check off items as they’re completed.

## Legend
- [ ] Pending
- [~] In Progress
- [x] Done

## Progress Notes

### ✅ Completed (Railway Agent + Vercel Frontend Deployment)
- **Railway Project**: `chef-chopsky` with production environment
- **Agent URL**: https://chef-chopsky-production.up.railway.app
- **Health Endpoint**: `/health` responding correctly with status `ok`
- **Configuration**: Using `railway.toml` config-as-code approach
- **Environment**: Production environment variables configured in Railway dashboard

- **Vercel Project**: `chef-chopsky` linked and deployed
- **Frontend URL**: https://chef-chopsky-production.vercel.app
- **Build Status**: ✅ Successful build and deployment
- **Environment**: Production environment variables configured
- **Configuration**: Fixed with proper `vercel.json` (Next.js framework detection)
- **Security**: Authentication protection disabled for public access
- **Git**: Changes committed and pushed to `feature/production-deployment` branch

### ✅ Completed (Production Supabase Setup)
- **Database Schema**: All 6 migration files successfully applied to production
- **Tables Created**: `conversation_runs`, `conversation_messages`, `conversation_analytics`, `conversations`, `messages`, `feedback`
- **Environment Variables**: All production credentials configured in Vercel
- **Frontend Integration**: Redeployed with production Supabase connection
- **Database Connection**: Verified through Supabase CLI and migration status

### 🚧 Next Steps (Phase 1 Completion)
1. **End-to-End Testing**: Test complete chat functionality on production
2. **Monitoring Setup**: Configure UptimeRobot for both services
3. **Smoke Testing**: Verify all core flows work end-to-end

---

## Phase 1 — MVP Production Deployment (Day 1)

### Objectives
- Deploy the app to a public URL with a production Supabase and basic uptime monitoring.

### Tasks
- [x] 1.1 Create Vercel project (frontend) and Railway project (agent) and link repos
- [x] 1.2 Configure production environment variables in Vercel
- [x] 1.3 Create production Supabase project; apply schema and enable backups
- [x] 1.4 Point frontend to production Supabase creds
- [ ] 1.5 Smoke test core flows on production URL
- [ ] 1.6 Set up UptimeRobot checks for frontend URL and agent `/health`

### Acceptance Criteria
- [x] Frontend accessible at public URL (Vercel)
- [x] Agent accessible at public URL (Railway) with `/health` endpoint
- [ ] Core chat functionality works end-to-end
- [x] DB schema deployed and read/write OK
- [ ] UptimeRobot active with email alerts
- [ ] No critical errors in logs

---

## Phase 2 — Environment Management & CI/CD (Days 2–5)

### Objectives
- Add staging, automate deployments, and formalize env configuration.

### Tasks
- [ ] 2.1 Create staging Vercel environment (separate project/environment) [Owner: Human]
  - Sub-tasks:
    - [ ] 2.1.a Create Vercel project/environment for staging
    - [ ] 2.1.b Configure staging env variables/secrets in Vercel
    - [ ] 2.1.c Verify preview domains and routing
- [ ] 2.2 Create staging Supabase project and env vars [Owner: Human]
  - Sub-tasks:
    - [ ] 2.2.a Create project; apply schema; enable backups
    - [ ] 2.2.b Generate anon/public keys; set in Vercel staging
- [ ] 2.3 Implement staging access control (password or IP allowlist) [Owner: Human]
- [ ] 2.4 Add env validation at startup and production guards [Owner: AI assist]
  - Sub-tasks:
    - [ ] 2.4.a Fail fast in production if required keys are missing/placeholders
    - [ ] 2.4.b Add clear console warnings in non-prod mock modes
- [ ] 2.5 Configure env-driven retriever/embedding (`RETRIEVER_PROVIDER`, `EMBEDDING_MODEL`) [Owner: AI assist]
  - Sub-tasks:
    - [ ] 2.5.a Read `RETRIEVER_PROVIDER` and `EMBEDDING_MODEL` from env
    - [ ] 2.5.b Defaults: local `memory`, staging `elastic-local` (or shared), prod `pinecone`/`elastic`/`mongodb`
- [ ] 2.6 Add per-env vector index/namespace (`LANGCHAIN_INDEX_NAME`, `MONGO_NAMESPACE_PREFIX`) [Owner: AI assist]
- [ ] 2.7 Ensure env discriminator in retrieval filters (`env=local|staging|production`) [Owner: AI assist]
- [ ] 2.8 CI: Automated production deployment on `main` [Owner: Human]
  - Sub-tasks:
    - [ ] 2.8.a Configure workflow triggers and required secrets
    - [ ] 2.8.b Add deploy notifications
- [ ] 2.9 CI: Staging deployments on feature branches [Owner: Human]
- [ ] 2.10 Monitoring: deployment notifications wired to CI [Owner: Human]
- [ ] 2.11 Update docs/runbooks: secrets, env setup, rollback [Owner: AI assist]
- [ ] 2.12 Tests: health checks, env separation checks pass on CI [Owner: Human]

### Acceptance Criteria
- [ ] Staging reachable, gated by access control
- [ ] Env config validated at startup; production cannot run with placeholders
- [ ] Retriever/provider and embeddings configurable via env per environment
- [ ] No cross-env data bleed (validated by per-env index + filters)
- [ ] CI deploys staging and production successfully

### Dependencies
- Staging setup before CI staging deploys
- Env variables and secrets before CI runs

---

## Phase 3 — Advanced Monitoring & Documentation (Days 6–7)

### Objectives
- Complete monitoring and documentation for low maintenance overhead.

### Tasks
- [ ] 3.1 Add Sentry (frontend + agent); set DSN per env
- [ ] 3.2 Configure performance monitoring where appropriate
- [ ] 3.3 Create maintenance procedures and troubleshooting guides
- [ ] 3.4 Add deployment rollback procedure and checklist
- [ ] 3.5 Validate metrics/alerts dashboards

### Acceptance Criteria
- [ ] Error monitoring active with alerts
- [ ] Docs complete and actionable
- [ ] Runbooks verified

---

## Cross-Cutting Tasks

- [ ] 4.1 Ensure `.env.example` files include new env vars (frontend/agent)
- [ ] 4.2 Update `scripts/setup-environment.sh` guidance as needed
- [ ] 4.3 Verify `.github/workflows` use env/secrets correctly

---

## Backlog (Future)

### Auth + User-Scoped Retrieval (separate project)
- [ ] 5.1 Supabase Auth integration (JWT) and user context to agent
- [ ] 5.2 Supabase RLS policies for user-scoped documents (pantry, notes)
- [ ] 5.3 Pinecone metadata schema `{ user_id, org_id?, env, doc_id, type }`
- [ ] 5.4 Sync worker: Supabase → Pinecone upsert/delete with retries
- [ ] 5.5 Post-retrieval authorization check against Supabase before returning data
- [ ] 5.6 E2E tests for user isolation

---

## Owners & Roles
- Human: accounts, CI/CD wiring, staging access control, secret management
- AI assist: configuration templates, validation scripts, documentation scaffolding

---

## Notes
- Keep costs under <$50/mo; prefer free tiers initially
- Favor Pinecone for retriever in staging/prod; memory for local
- Maintain per-env isolation with index/namespace + `env` filters

