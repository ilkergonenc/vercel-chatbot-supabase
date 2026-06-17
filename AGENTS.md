# AI agent instructions

## Project overview

This repository is a local clone of the Vercel Chatbot template. It is a Next.js App Router application that provides chat, streaming AI responses, tools, artifacts, document history, image attachments, guest access, and persisted chat history.

The current task track is a stack migration only. Keep the application behavior, routes, UX, and product logic as close as possible to the upstream Vercel chatbot architecture.

## Current stack

- Next.js App Router, React, TypeScript
- Tailwind CSS and shadcn-style UI primitives
- Vercel AI SDK
- Vercel AI Gateway for model access
- Drizzle ORM with Postgres via `postgres`
- Neon/Vercel Postgres-style `POSTGRES_URL`
- Auth.js / NextAuth v5 credentials and guest providers
- Vercel Blob for public attachment uploads
- Redis via `REDIS_URL` for rate limiting and resumable streams
- Playwright for E2E tests
- Ultracite/Biome tooling through `pnpm check` and `pnpm fix`

## Target stack

- Keep Next.js App Router, React, TypeScript, Tailwind/shadcn, Drizzle, and Vercel AI SDK.
- Replace Vercel AI Gateway with direct OpenAI usage through the AI SDK.
- Replace Neon/Postgres setup with Supabase Postgres.
- Replace Vercel Blob with Supabase Storage.
- Replace Auth.js / NextAuth with Supabase Auth.

## Non-goals

- Do not redesign the product, routes, UX, sidebar, chat behavior, artifact behavior, or document model.
- Do not rewrite the app around Supabase client-side data access.
- Do not replace Drizzle.
- Do not rename existing database tables during the first database migration.
- Do not combine the auth migration with DB, storage, or AI provider migration.
- Do not remove working code until the replacement phase has been verified.

## Migration principles

- Stay close to upstream Vercel chatbot architecture and conventions.
- Prefer small, reversible phases with one provider change at a time.
- Keep existing API routes and response shapes when possible.
- Keep existing chat, document, artifact, stream, and vote logic.
- Preserve the upload API response shape if possible.
- Migrate auth last. Identity and ownership changes are the highest-risk part.
- Treat guest/anonymous user behavior as an explicit architecture decision.
- Mark assumptions in docs and implementation notes.

## Coding conventions observed

- TypeScript path alias `@/` is used throughout.
- Server-only database access is centralized in `lib/db/queries.ts`.
- Drizzle schema is centralized in `lib/db/schema.ts`.
- Route handlers live under `app/(chat)/api/**/route.ts` and call query helpers rather than SQL directly.
- Auth access currently uses `auth()` from `app/(auth)/auth.ts` on the server and `useSession` / `signOut` from `next-auth/react` on the client.
- Errors use `ChatbotError` from `lib/errors.ts`.
- AI provider access is centralized through `lib/ai/providers.ts`; model metadata is in `lib/ai/models.ts`.
- Keep code style consistent with the repo: double quotes, semicolons, concise helper functions, and existing component patterns.

## Test and build commands

- Install dependencies: `pnpm install`
- Static checks: `pnpm check`
- Auto-fix formatting/lint where appropriate: `pnpm fix`
- Generate Drizzle migrations: `pnpm db:generate`
- Run migrations: `pnpm db:migrate`
- Check Drizzle schema/database state when configured: `pnpm db:check`
- Build: `pnpm build`
- Tests on Unix-like shells: `PLAYWRIGHT=True pnpm exec playwright test`
- Tests on PowerShell: `$env:PLAYWRIGHT='True'; pnpm exec playwright test`

## Safety rules before editing files

- Inspect the relevant files before editing.
- Check `git status --short` and do not overwrite unrelated user changes.
- Keep each phase isolated. Do not sneak in cleanup from later phases.
- Do not add secrets or real credentials.
- Do not create Supabase projects, storage buckets, or migrations unless the phase explicitly calls for it.
- Do not change `package.json` except in implementation phases that require dependency changes.
- Do not delete existing code as part of planning-only work.

## Required verification after each phase

- Run `pnpm check`.
- Run `pnpm db:check` when the database env is available and the phase touches DB behavior.
- Run `pnpm build` when environment variables and services are available.
- Run targeted Playwright tests or document why they could not run.
- Manually verify the affected route or UI flow.
- Record rollback notes and any follow-up decisions in `docs/migration/README.md` or the relevant phase document.
