# Phase prompts

Copy these prompts into future Codex sessions. Each phase should run on its own branch or clean checkpoint.

## Phase 0 audit prompt

```text
You are working in this local Vercel Chatbot clone. Do not redesign product logic. Do not implement provider, DB, storage, or auth changes yet.

First inspect the repo, including AGENTS.md and docs/migration/*. Run a baseline audit for the migration. Check git status, inspect package.json, env examples, DB schema/migrations, auth files, storage upload route, AI provider files, middleware/proxy, and tests. Run safe verification commands: pnpm check, pnpm build if env vars are available, and Playwright if the local env can support it.

Keep diffs tiny and documentation-only unless I explicitly approve runtime changes. Record baseline findings and any skipped verification with reasons. Include rollback notes, even if no code changed. Do not make unrelated changes.
```

## Phase 1 OpenAI provider migration prompt

```text
Implement Phase 1 only: migrate Vercel AI Gateway to direct OpenAI through the Vercel AI SDK. Do not redesign product logic. Do not change database, storage, or auth behavior.

First inspect AGENTS.md, docs/migration/roadmap.md, docs/migration/ai-provider-plan.md, package.json, lib/ai/providers.ts, lib/ai/models.ts, app/(chat)/api/chat/route.ts, app/(chat)/actions.ts, app/(chat)/api/models/route.ts, lib/errors.ts, and any Gateway UI copy. Use small diffs.

Preserve streaming, tool calling, chat persistence, title generation, and model selection. Replace Gateway dynamic catalog/capabilities with a small static OpenAI model list. Update env docs from AI_GATEWAY_API_KEY to OPENAI_API_KEY. Remove only Gateway-specific code that is actually replaced in this phase.

Run pnpm check and pnpm build if env vars are available. Manually verify or describe how to verify chat streaming and tools. Include rollback notes. Do not make unrelated changes.
```

## Phase 2 Supabase DB migration prompt

```text
Implement Phase 2 only: move the existing Drizzle/Postgres connection to Supabase Postgres. Do not redesign product logic. Do not change auth, storage, AI provider behavior, routes, UX, table names, or schema semantics unless strictly required for the connection.

First inspect AGENTS.md, docs/migration/supabase-db-plan.md, docs/migration/env.md, drizzle.config.ts, lib/db/schema.ts, lib/db/queries.ts, lib/db/migrate.ts, and lib/db/migrations. Use small diffs.

Keep Drizzle. Reuse existing migrations if possible. Add runtime vs migration connection handling, with Supabase pooler prepared-statement warning handled in code. Prefer DATABASE_URL for runtime and DIRECT_DATABASE_URL for migrations, with any temporary POSTGRES_URL fallback clearly documented.

Run pnpm check, pnpm db:migrate if credentials are available, and pnpm build if env vars are available. Include rollback notes. Do not make unrelated changes.
```

## Phase 3 Supabase Storage migration prompt

```text
Implement Phase 3 only: replace Vercel Blob with Supabase Storage using a public bucket first. Do not redesign product logic. Do not change database schema, auth system, AI provider, chat routes, or UX beyond what is required for uploads.

First inspect AGENTS.md, docs/migration/storage-plan.md, docs/migration/env.md, app/(chat)/api/files/upload/route.ts, components/chat/multimodal-input.tsx, components/chat/preview-attachment.tsx, components/chat/message.tsx, next.config.ts, and package.json. Use small diffs.

Preserve current validation rules: JPEG/PNG only, max 5 MB. Preserve the upload API response shape { url, pathname, contentType } if possible. Use a public Supabase Storage bucket named chat-attachments unless the env/config says otherwise. Update image remote patterns.

Run pnpm check and pnpm build if env vars are available. Verify upload success/failure cases or describe manual verification. Include rollback notes. Do not make unrelated changes.
```

## Phase 4 Supabase Auth migration prompt

```text
Implement Phase 4 only: replace Auth.js/NextAuth with Supabase Auth. Do not redesign product logic. Do not combine this with DB provider, storage, or AI provider changes.

First inspect AGENTS.md, docs/migration/auth-plan.md, docs/migration/decisions.md, app/(auth), proxy.ts, app/layout.tsx, app/(chat)/layout.tsx, all route handlers that call auth(), client components that import next-auth, lib/ai/tools, lib/artifacts/server.ts, lib/ai/entitlements.ts, and tests. Use small staged diffs.

Preserve the current app session shape as much as possible: session.user.id, session.user.email, and session.user.type. Keep the app-owned User/Profile table and map it to Supabase Auth users. Treat guest/anonymous behavior as the highest-risk decision; do not silently drop guest functionality unless explicitly decided. Preserve chat/document ownership checks.

Run pnpm check and pnpm build if env vars are available. Run targeted auth and chat tests if possible. Include rollback notes and migration caveats for existing users. Do not make unrelated changes.
```

## Phase 5 cleanup prompt

```text
Implement Phase 5 only: cleanup, docs, hardening, and optional private storage planning after Phases 1-4 are verified. Do not redesign product logic.

First inspect AGENTS.md, docs/migration, package.json, .env.example, README.md, vercel-template.json, next.config.ts, and search for obsolete references to AI Gateway, Vercel Blob, NextAuth/Auth.js, and POSTGRES_URL. Use small diffs.

Remove only unused dependencies, env docs, and obsolete copy that are no longer referenced. Harden Supabase docs/policies. If private storage is desired, plan it separately unless explicitly approved for implementation. Add or update tests only for migrated behavior.

Run pnpm check, pnpm build if env vars are available, and relevant Playwright tests. Include rollback notes. Do not make unrelated changes.
```
