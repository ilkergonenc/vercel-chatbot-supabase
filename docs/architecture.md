# Architecture

This app is a Next.js App Router chatbot based on the Vercel Chatbot template. It preserves the upstream shape for chat routes, streaming responses, tools, artifacts, document history, votes, attachments, guest access, and persisted chat history.

## Current stack

- Next.js App Router, React, TypeScript
- Tailwind CSS and shadcn-style UI primitives
- AI SDK with direct OpenAI provider usage through `@ai-sdk/openai`
- Supabase Auth for email/password and anonymous guest sessions
- Supabase Storage for chat attachments
- Supabase Postgres with Drizzle ORM
- Redis for rate limiting and resumable streams
- Playwright for browser/user-flow tests

## Important code paths

- AI provider construction: `lib/ai/providers.ts`
- Model metadata: `lib/ai/models.ts`
- Auth/session facade: `lib/auth/session.ts`
- Supabase clients and middleware helpers: `lib/supabase/`
- Storage URL handling: `lib/supabase/storage.ts`
- Database schema: `lib/db/schema.ts`
- Database queries: `lib/db/queries.ts`
- Upload route: `app/(chat)/api/files/upload/route.ts`

## Current provider notes

The app uses OpenAI directly through the AI SDK OpenAI provider. Vercel AI Gateway is historical migration context only.

The app uses Supabase Auth instead of NextAuth. Keep the local app session shape small and stable: `session.user.id`, `session.user.email`, `session.user.type`, and optional profile fields.

The app uses Supabase Storage instead of Vercel Blob. Upload responses preserve `{ url, pathname, contentType }`.
