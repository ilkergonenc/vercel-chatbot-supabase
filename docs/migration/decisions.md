# Architecture decisions

These are default decisions for the migration. Change them only after inspecting the repo and recording the reason in the decision log.

## Defaults

- Keep Drizzle.
- Keep the existing database schema as much as possible.
- Supabase Postgres replaces the Postgres provider, not the application data model.
- Keep the app-owned `User` or profile table, but later map it to Supabase Auth users.
- Do not rename tables during the first migration.
- Use a public Supabase Storage bucket first to match current Vercel Blob behavior.
- Preserve the upload API response shape if possible.
- Replace Gateway dynamic model catalog with a small static OpenAI model list.
- Migrate auth last.
- Treat guest/anonymous auth as the highest-risk decision.
- Keep non-target Vercel utilities unless explicitly removed later.

## Rationale

The current codebase already has strong provider boundaries:

- Database access is centralized in `lib/db/queries.ts`.
- AI provider construction is centralized in `lib/ai/providers.ts`.
- Storage upload is centralized in `app/(chat)/api/files/upload/route.ts`.
- Auth is broadly referenced, so it should be isolated to its own phase.

Keeping those boundaries reduces blast radius and makes rollback easier.

## Open decisions

| Decision | Default | Why it matters |
| --- | --- | --- |
| OpenAI model list | Small static list | Gateway model IDs do not map directly to OpenAI IDs. |
| Guest behavior | Preserve current UX if possible | Current app silently creates guest users. |
| User ID mapping | Supabase `auth.users.id` should map to app `User.id` | Chat, document, suggestion, and stream ownership depend on user IDs. |
| Storage privacy | Public first, private later | Current Vercel Blob behavior stores public URLs in messages. |
| DB env naming | `DATABASE_URL` runtime and `DIRECT_DATABASE_URL` migrations | Supabase pooler and migration connections have different needs. |
| Non-target Vercel utilities | Keep by default | `@vercel/functions`, `@vercel/otel`, `@vercel/analytics`, `botid`, template links, and `avatar.vercel.sh` are separate from Gateway/Blob/Neon/Auth.js. |

## Storage persistence note

Uploaded attachment URLs are currently persisted inside AI SDK message `parts` as `file` parts. The `Message_v2.attachments` column is currently written as `[]` in `app/(chat)/api/chat/route.ts`. Private storage or signed URL designs must account for this before changing URL persistence.

## Decision log

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-06-17 | Keep first migration phases provider-focused. | Avoid product redesign and reduce rollback risk. |
