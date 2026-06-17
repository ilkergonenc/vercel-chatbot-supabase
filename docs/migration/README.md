# Migration index

This directory records the completed Vercel Chatbot provider migration while keeping the original application architecture and product behavior intact.

Target migration:

- Vercel AI Gateway to direct OpenAI via Vercel AI SDK: complete
- Neon/Postgres connection setup to Supabase Postgres while keeping Drizzle: complete
- Vercel Blob to Supabase Storage: complete
- Auth.js / NextAuth to Supabase Auth: complete

## Current stack

- OpenAI through the AI SDK OpenAI provider
- Supabase Auth with email/password and anonymous guest users
- Supabase Storage public bucket for chat attachments
- Supabase Postgres with Drizzle ORM
- Redis for rate limiting and resumable streams

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
| Phase 2 | Supabase Postgres | Complete | Uses `DATABASE_URL` for runtime and `DIRECT_DATABASE_URL` for migrations while keeping Drizzle. |
| Phase 3 | Supabase Storage | Complete | Uses a public bucket to preserve existing attachment URL behavior. |
| Phase 4 | Supabase Auth | Complete | Uses Supabase Auth with anonymous guest users and app-owned profile rows. |
| Phase 5 | Cleanup and hardening | Complete | Removed obsolete direct dependencies and synced final setup docs. |

## Remaining optional work

- Remove historical migration planning notes when they are no longer useful.
- Consider private Supabase Storage in a separate design phase.
- Remove the legacy `POSTGRES_URL` fallback after all deployments use `DATABASE_URL` and `DIRECT_DATABASE_URL`.
- Remove old Vercel template marketplace references only if the project stops tracking upstream template positioning.

## Decision log

Record changes to the default migration decisions here.

| Date | Decision | Reason | Owner |
| --- | --- | --- | --- |
| 2026-06-17 | Initial roadmap created. | Prepare safe AI-assisted implementation. | Codex |
