# AI agent instructions

## Entry point

This file is the main entry point for coding agents in this repository. Repo inspection wins over stale documentation: read the current code before editing, and prefer the implementation as the source of truth when docs disagree.

## Project overview

This repository is a local clone of the Vercel Chatbot template. It is a Next.js App Router application for chat, streaming AI responses, tools, artifacts, document history, image attachments, guest access, and persisted chat history.

Preserve current working behavior. Keep routes, UX, chat behavior, artifact behavior, document ownership, and API response shapes close to the upstream chatbot architecture unless the user explicitly asks for a product change.

## Current stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS and shadcn-style UI primitives
- AI SDK with direct OpenAI provider usage through `@ai-sdk/openai`
- Supabase Auth for email/password and anonymous guest users
- Supabase Storage for chat attachments
- Supabase Postgres with Drizzle ORM and `postgres`
- Redis via `REDIS_URL` for rate limiting and resumable streams
- Playwright for browser/user-flow tests
- Ultracite/Biome through `pnpm check` and `pnpm fix`

Historical migration docs may mention NextAuth, Vercel Blob, Vercel AI Gateway, Neon, or Vercel Postgres. Those are no longer the current architecture unless explicitly described as history.

## Architecture pointers

- Current architecture: `docs/architecture.md`
- Database setup: `docs/database.md`
- Testing commands and expectations: `docs/testing.md`
- Shared agent context: `.agents/context/project.md`
- Safe workflow checklist: `.agents/checklists/change-safety.md`
- Historical migration archive: `docs/migration/`

## Coding rules

- Inspect relevant files before editing.
- Keep changes small, reversible, and scoped to the request.
- Do not refactor aggressively or move files/packages unless explicitly requested.
- Do not change application behavior while doing documentation/tooling cleanup.
- Do not modify package dependencies unless the task explicitly requires it.
- Do not add secrets or real credentials.
- Do not touch `.env` files except to inspect filenames or documented variable names.
- Do not run database migrations unless explicitly requested.
- Do not modify production data.
- Keep Supabase service role usage server-only.
- Keep Drizzle as the app data layer unless explicitly asked otherwise.
- Keep model/provider changes centralized in `lib/ai`.
- Add or update regression tests when fixing bugs.
- Prefer Playwright for browser and user-flow regressions.

## Code ownership conventions

- TypeScript path alias `@/` is used throughout.
- Server-only database access is centralized in `lib/db/queries.ts`.
- Drizzle schema is centralized in `lib/db/schema.ts`.
- Supabase auth/session access is centralized through `lib/auth/session.ts` and `lib/supabase/`.
- Supabase Storage helpers live in `lib/supabase/storage.ts`.
- Route handlers live under `app/**/api/**/route.ts` and should call shared helpers instead of duplicating provider logic.
- Errors use `ChatbotError` from `lib/errors.ts` where the existing code does so.
- Keep style consistent with the repo: double quotes, semicolons, concise helpers, and existing component patterns.

## Test and build commands

- Install dependencies: `pnpm install`
- Static checks: `pnpm check`
- Auto-fix formatting/lint where appropriate: `pnpm fix`
- Generate Drizzle migrations: `pnpm db:generate`
- Run migrations: `pnpm db:migrate` only when explicitly requested
- Check Drizzle schema/database state: `pnpm db:check` when database env is configured
- Build: `pnpm build` when environment variables and services are available
- Playwright tests: `pnpm test`
- Headed Playwright tests: `pnpm test:headed`
- Playwright UI: `pnpm test:ui`
- Playwright report: `pnpm test:report`

For PowerShell without the package script, use `$env:PLAYWRIGHT='True'; pnpm exec playwright test`.
