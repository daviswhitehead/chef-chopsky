# Auth + User-Scoped Retrieval (Backlog)

This project is intentionally scoped for a future phase. It documents the planned architecture for adding authentication and enabling the agent to access user-specific documents (e.g., pantry items) with strict isolation.

## Objective
Enable authenticated, user-scoped retrieval for Chef Chopsky while maintaining clear environment isolation and strong access controls.

## Architecture Overview
- **Auth**: Supabase Auth (JWT). The frontend obtains a token; the agent receives `user_id`/`org_id` claims and uses them throughout the retrieval flow.
- **Source of Truth**: Supabase tables for documents and pantry data, protected by RLS policies keyed to `user_id` (and `org_id` if needed).
- **Vector Search**: Pinecone as the embedding store only. Vectors carry metadata `{ user_id, org_id?, env, doc_id, type }`.
- **Sync Service**: Background worker listens for Supabase insert/update/delete and upserts/deletes vectors in Pinecone.
- **Query Flow**: Agent filters Pinecone by `user_id`/`org_id` and `env`, then re-validates authorization by fetching the canonical record in Supabase before returning results.

## Deliverables
1. Supabase schema & RLS policies for user-scoped docs (pantry, notes, uploads)
2. Pinecone index/namespace per environment + metadata schema
3. Embedding sync worker (with retries, backoff, observability)
4. Agent changes to include auth context and enforce post-retrieval authorization
5. E2E tests for user isolation and access control

## Acceptance Criteria
- [ ] Users can only retrieve their own documents via the agent
- [ ] Cross-user and cross-environment isolation validated by automated tests
- [ ] Deletions in Supabase remove vectors in Pinecone within SLA
- [ ] Observability dashboards/alerts for sync health and mismatches

## Notes
- Keep per-environment isolation from v6 (separate indexes/namespaces + `env` metadata)
- Consider `org_id` for team/workspace support
- Plan for GDPR erasure requests (hard delete vectors)
- Cost-control: small embedding dims, batch upserts, tune `k`

---

This project will be prioritized after v6 deployment and environment management are complete.

