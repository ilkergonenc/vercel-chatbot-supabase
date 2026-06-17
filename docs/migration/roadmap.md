# Migration roadmap

This roadmap is based on the current repository inspection. It is a stack/tool migration only. Do not redesign product logic.

## Phase 0: baseline audit and tests

### Goal

Establish a known-good baseline before changing runtime behavior.

### Files likely affected

- Documentation only, if recording findings:
  - `docs/migration/README.md`
  - `docs/migration/roadmap.md`

### Files that must not be changed

- Runtime application files under `app`, `components`, `hooks`, `lib`, and `artifacts`
- `package.json`
- `pnpm-lock.yaml`
- Drizzle migrations

### Expected implementation outline

- Run `git status --short`.
- Inspect current environment availability without printing secrets.
- Run `pnpm install` if dependencies are missing.
- Run `pnpm check`.
- Run `pnpm db:check` if the database env is available and the command can connect safely.
- Run `pnpm build` if required env vars are available.
- Run Playwright with the current test setup if services and env vars are available.
- Run the current model selector tests before Phase 1 to capture Gateway-era expectations.
- Record failures as baseline issues, not migration regressions.

### Environment variables

Current app may need:

- `AUTH_SECRET`
- `AI_GATEWAY_API_KEY` outside Vercel
- `BLOB_READ_WRITE_TOKEN`
- `POSTGRES_URL`
- `REDIS_URL` for resumable streams and production rate limiting

### Verification checklist

- [ ] `git status --short` reviewed.
- [ ] `pnpm check` result recorded.
- [ ] Optional `pnpm db:check` result recorded or skipped with reason.
- [ ] `pnpm build` result recorded or skipped with reason.
- [ ] Playwright result recorded or skipped with reason.
- [ ] Current model selector test behavior recorded before changing model providers.
- [ ] Current chat, upload, auth, and DB behavior understood.

### Rollback notes

No runtime changes should be made in this phase.

### Risks

- Missing local env vars may prevent build or E2E verification.
- Existing upstream issues should not be confused with migration defects.

## Phase 1: Vercel AI Gateway to direct OpenAI via Vercel AI SDK

### Goal

Replace Gateway model access with direct OpenAI provider usage while preserving chat streaming, tool calling, title generation, model selection, and persistence.

### Files likely affected

- `package.json`
- `pnpm-lock.yaml`
- `.env.example`
- `lib/ai/providers.ts`
- `lib/ai/models.ts`
- `app/(chat)/api/chat/route.ts`
- `app/(chat)/actions.ts`
- `app/(chat)/api/models/route.ts`
- `hooks/use-active-chat.tsx`
- `lib/errors.ts`
- `components/chat/shell.tsx`
- `app/(auth)/layout.tsx`
- `tests/e2e/model-selector.test.ts`
- `tests/pages/chat.ts`
- `README.md`

### Files that must not be changed

- Auth files under `app/(auth)` except copy that explicitly mentions AI Gateway.
- Database files under `lib/db`.
- Storage upload route.
- Drizzle migrations.

### Expected implementation outline

- Add `@ai-sdk/openai`.
- Replace `gateway.languageModel(modelId)` with OpenAI provider model construction.
- Replace Gateway model IDs with a small static OpenAI model list.
- Replace dynamic Gateway capability fetches with static capability metadata.
- Remove `providerOptions.gateway`.
- Keep OpenAI provider options where supported.
- Remove Gateway activation error copy and UI after direct OpenAI errors are handled.
- Update `hooks/use-active-chat.tsx`, which currently checks for AI Gateway credit-card/activation errors and toggles the activation alert.
- Update model selector tests because they currently expect Gateway-era providers/models such as Kimi, Mistral, DeepSeek, and Grok. They will need OpenAI-only expectations after the model list changes.

### Environment variables

- Remove: `AI_GATEWAY_API_KEY`
- Add: `OPENAI_API_KEY`

### Verification checklist

- [ ] `pnpm check`
- [ ] `pnpm build`
- [ ] Send a normal chat message and receive a streamed response.
- [ ] Generate a title for a new chat.
- [ ] Trigger a tool call such as weather if supported by the selected model.
- [ ] Create/edit/update artifacts.
- [ ] `/api/models` returns expected static capabilities.

### Rollback notes

Restore `lib/ai/providers.ts`, `lib/ai/models.ts`, Gateway provider options, and `AI_GATEWAY_API_KEY`.

### Risks

- Gateway model IDs do not map one-to-one to OpenAI model IDs.
- Capability metadata must be accurate enough to avoid enabling unsupported tools or reasoning.
- Gateway fallback/order behavior is lost.
- Existing model selector tests encode Gateway-era model names and provider groups.

## Phase 2: Neon/Postgres connection to Supabase Postgres while keeping Drizzle

### Goal

Move the existing Drizzle/Postgres data layer to Supabase Postgres without changing the app data model.

### Files likely affected

- `.env.example`
- `drizzle.config.ts`
- `lib/db/queries.ts`
- `lib/db/migrate.ts`
- `README.md`
- `docs/migration/env.md`

### Files that must not be changed

- Auth implementation.
- Storage upload implementation.
- AI provider implementation.
- Existing table names and application query semantics.

### Expected implementation outline

- Keep Drizzle.
- Keep `lib/db/schema.ts` initially unchanged unless Supabase requires a narrowly scoped connection-related adjustment.
- Introduce `DATABASE_URL` for runtime connection.
- Introduce `DIRECT_DATABASE_URL` for migrations when needed.
- Configure `postgres` with `prepare: false` for Supabase transaction pooler runtime URLs.
- Run existing Drizzle migrations against Supabase Postgres.

### Environment variables

- Replace or alias: `POSTGRES_URL`
- Add: `DATABASE_URL`
- Add: `DIRECT_DATABASE_URL` for migrations

### Verification checklist

- [ ] `pnpm db:migrate` succeeds against Supabase.
- [ ] `pnpm check`
- [ ] `pnpm build`
- [ ] Register/login still works through current Auth.js flow.
- [ ] Chat history save/read/delete works.
- [ ] Document and suggestion persistence works.

### Rollback notes

Point the app back to the previous `POSTGRES_URL` and restore connection env names if changed.

### Risks

- Supabase transaction pooler and prepared statements can conflict unless `prepare: false` is used.
- Build-time migrations on Vercel may require a direct/session connection rather than transaction pooling.
- Auth phase later may require schema changes for `auth.users` mapping.

## Phase 3: Vercel Blob to Supabase Storage with public bucket first

### Goal

Replace Vercel Blob uploads with Supabase Storage while preserving the current attachment upload route behavior and public URL persistence.

### Files likely affected

- `package.json`
- `pnpm-lock.yaml`
- `.env.example`
- `app/(chat)/api/files/upload/route.ts`
- `next.config.ts`
- `README.md`

### Files that must not be changed

- Chat persistence schema unless strictly necessary.
- Auth implementation.
- AI provider implementation.
- Client attachment components if the upload response shape can be preserved.

### Expected implementation outline

- Add Supabase client package if not already added in Phase 2.
- Create or document a `chat-attachments` public bucket.
- Upload files to a path such as `{userId}/{timestamp-or-uuid}-{safeName}`.
- Return `{ url, pathname, contentType }` to match current client expectations.
- Update `next/image` remote patterns for the Supabase Storage public URL host.
- Preserve the current persistence model: uploaded attachment URLs live in AI SDK message `parts` as `file` parts, while `Message_v2.attachments` is currently saved as `[]` in `app/(chat)/api/chat/route.ts`.

### Environment variables

- Remove: `BLOB_READ_WRITE_TOKEN`
- Add: `NEXT_PUBLIC_SUPABASE_URL`
- Add: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Add server-only key only if needed: `SUPABASE_SERVICE_ROLE_KEY`
- Optional: `SUPABASE_STORAGE_BUCKET`

### Verification checklist

- [ ] `pnpm check`
- [ ] `pnpm build`
- [ ] Upload JPEG and PNG under 5 MB.
- [ ] Reject unsupported type and oversized files.
- [ ] Preview image before sending.
- [ ] Sent message renders attachment after reload.
- [ ] Unauthorized upload returns 401.

### Rollback notes

Restore `@vercel/blob` upload route, Blob env var, and Blob image remote pattern.

### Risks

- Public bucket matches current behavior but exposes URLs to anyone who has them.
- Private bucket requires signed URL refresh logic because message parts currently store display URLs.
- Private bucket design must account for the fact that the current `attachments` DB column is not the source of rendered attachments.
- There is no current delete flow for uploaded files.

## Phase 4: Auth.js/NextAuth to Supabase Auth

### Goal

Replace NextAuth credentials and guest sessions with Supabase Auth while preserving route protection, user/session shape, and ownership checks as much as possible.

### Files likely affected

- `package.json`
- `pnpm-lock.yaml`
- `.env.example`
- `proxy.ts`
- `app/layout.tsx`
- `app/(auth)/auth.ts`
- `app/(auth)/auth.config.ts`
- `app/(auth)/actions.ts`
- `app/(auth)/api/auth/[...nextauth]/route.ts`
- `app/(auth)/api/auth/guest/route.ts`
- `app/(chat)/layout.tsx`
- all route handlers and server actions that call `auth()`
- components that import `next-auth` client APIs
- `lib/ai/entitlements.ts`
- `lib/artifacts/server.ts`
- `lib/ai/tools/*`
- tests under `tests/e2e`

### Files that must not be changed

- AI provider migration files unless a session type import requires a local type replacement.
- Storage upload behavior except auth helper integration.
- Database provider connection logic except user mapping/profile changes.

### Expected implementation outline

- Add Supabase SSR helpers.
- Create a local app session helper that returns a shape compatible with current `session.user.id`, `session.user.email`, and `session.user.type`.
- Replace server `auth()` usage with that helper.
- Replace client `SessionProvider`, `useSession`, and `signOut` usage with Supabase Auth equivalents or a small local auth provider.
- Replace login/register actions with Supabase email/password auth.
- Replace middleware token checks with Supabase cookie/session handling.
- Decide and implement anonymous/guest behavior in a dedicated sub-step.
- Map app-owned `"User"` rows to Supabase `auth.users.id`.
- Handle `proxy.ts` carefully: it has a broad matcher including `/api/:path*` and a catch-all route, while `/api/auth` is manually exempted. Supabase Auth middleware must avoid redirect loops and accidental API blocking.

### Environment variables

- Remove: `AUTH_SECRET`
- Add: `NEXT_PUBLIC_SUPABASE_URL`
- Add: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Add server-only key only if needed for admin migration scripts: `SUPABASE_SERVICE_ROLE_KEY`

### Verification checklist

- [ ] `pnpm check`
- [ ] `pnpm build`
- [ ] Logged-out user gets intended guest or auth behavior.
- [ ] Register works.
- [ ] Login works.
- [ ] Logout works.
- [ ] Private chats are only visible to owner.
- [ ] Public chats are readable as before.
- [ ] Existing chat/document ownership is preserved or migration caveats are documented.

### Rollback notes

Rollback is complex after user identity changes. Keep this phase isolated on its own branch and verify against a disposable Supabase project first.

### Risks

- User ID mapping can break chat and document ownership.
- Current guest flow creates a DB user automatically; Supabase anonymous behavior must be chosen deliberately.
- Middleware cookie refresh errors can cause redirect loops.
- The broad proxy matcher can block APIs or static-like routes if exemptions are incomplete.
- Client code currently depends on NextAuth loading/session semantics.

## Phase 5: cleanup, docs, hardening, optional private storage

### Goal

Remove obsolete provider references, harden Supabase policies, and document the final setup after all replacement phases are verified.

### Files likely affected

- `package.json`
- `pnpm-lock.yaml`
- `.env.example`
- `README.md`
- `vercel-template.json`
- docs under `docs/migration`
- tests

### Files that must not be changed

- Do not change core product logic unless fixing migration regressions.

### Expected implementation outline

- Remove unused dependencies and env docs.
- Remove obsolete Gateway, Blob, and NextAuth copy.
- Add final Supabase setup notes.
- Add or document Storage RLS policies.
- Consider private bucket migration if desired.
- Add cleanup strategy for orphaned uploaded files.

### Environment variables

Final env should not include `AI_GATEWAY_API_KEY`, `BLOB_READ_WRITE_TOKEN`, or `AUTH_SECRET`.

### Verification checklist

- [ ] `pnpm check`
- [ ] `pnpm build`
- [ ] E2E tests pass or known gaps documented.
- [ ] No runtime imports from removed packages.
- [ ] README and `.env.example` match actual stack.

### Rollback notes

Rollback individual cleanup commits if they remove something still referenced.

### Risks

- Removing packages before all references are gone can break builds.
- Policy hardening can accidentally block valid uploads or reads.
- Do not automatically remove Vercel-adjacent utilities such as `@vercel/functions`, `@vercel/otel`, `@vercel/analytics`, `botid`, Vercel template links, or `avatar.vercel.sh`; they are separate from the requested provider migration unless explicitly removed later.
