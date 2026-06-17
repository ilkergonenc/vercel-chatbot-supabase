# Migration index

This directory prepares the Vercel Chatbot project for a provider migration while keeping the original application architecture and product behavior intact.

Target migration:

- Vercel AI Gateway to direct OpenAI via Vercel AI SDK
- Neon/Postgres connection setup to Supabase Postgres while keeping Drizzle
- Vercel Blob to Supabase Storage
- Auth.js / NextAuth to Supabase Auth

## Documents

- [Roadmap](./roadmap.md)
- [Architecture decisions](./decisions.md)
- [Environment variables](./env.md)
- [Auth plan](./auth-plan.md)
- [Storage plan](./storage-plan.md)
- [AI provider plan](./ai-provider-plan.md)
- [Supabase DB plan](./supabase-db-plan.md)
- [Skills and agent setup](./skills.md)
- [Phase prompts](./phase-prompts.md)

## Recommended order

1. Phase 0: baseline audit and tests
2. Phase 1: Vercel AI Gateway to direct OpenAI
3. Phase 2: Supabase Postgres connection while keeping Drizzle
4. Phase 3: Supabase Storage with a public bucket first
5. Phase 4: Supabase Auth
6. Phase 5: cleanup, docs, hardening, optional private storage

Auth is intentionally last because it changes identity, cookies, middleware behavior, and ownership checks.

## General warnings

- Do not automatically remove `@vercel/functions`, `@vercel/otel`, `@vercel/analytics`, `botid`, Vercel template links, or `avatar.vercel.sh` just because they mention Vercel. They are separate from the requested provider migration unless explicitly removed later.
- Before Phase 1, run the current model selector tests to capture Gateway-era provider/model expectations.
- For storage, persisted attachment URLs currently live in AI SDK message `parts` as `file` parts. `Message_v2.attachments` is currently saved as `[]`.

## Current status

| Phase | Scope | Status | Notes |
| --- | --- | --- | --- |
| Phase 0 | Baseline audit and tests | Complete | Static checks, DB check, and build pass; Playwright browser install is a local limitation. |
| Phase 1 | Direct OpenAI provider | Complete | Uses `@ai-sdk/openai`, static OpenAI model metadata, and `OPENAI_API_KEY`. |
| Phase 2 | Supabase Postgres | Not started | Keep Drizzle and existing schema as much as possible. |
| Phase 3 | Supabase Storage | Not started | Start with public bucket to match Vercel Blob behavior. |
| Phase 4 | Supabase Auth | Not started | Highest-risk phase; do not combine with other migrations. |
| Phase 5 | Cleanup and hardening | Not started | Remove old provider references after verification. |

## Decision log

Record changes to the default migration decisions here.

| Date | Decision | Reason | Owner |
| --- | --- | --- | --- |
| 2026-06-17 | Initial roadmap created. | Prepare safe AI-assisted implementation. | Codex |
