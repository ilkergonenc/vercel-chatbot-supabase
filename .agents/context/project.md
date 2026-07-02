# Project context for agents

This repository is a Supabase-backed Vercel Chatbot template clone.

Current architecture:

- Next.js App Router with React and TypeScript
- AI SDK using direct OpenAI provider access
- Supabase Auth, Storage, and Postgres
- Drizzle ORM as the server-side data layer
- Redis for rate limiting and resumable streams

Historical migration documents are archived under `docs/migration/archive/`. Treat them as history unless a user explicitly asks to revisit a migration decision.

Do not assume NextAuth, Vercel Blob, Vercel AI Gateway, or Neon are current systems.
