# Codex repository instructions

Read `AGENTS.md` before making changes in this repository.

This project is preparing a stack/tool migration only:

- Vercel AI Gateway to direct OpenAI through Vercel AI SDK
- Neon/Postgres setup to Supabase Postgres while keeping Drizzle
- Vercel Blob to Supabase Storage
- Auth.js / NextAuth to Supabase Auth

Do not redesign product logic or UX. Keep the app close to the upstream Vercel Chatbot architecture. Use the phase docs under `docs/migration/` and keep changes small, reversible, and phase-scoped.

Do not combine auth migration with DB, storage, or AI provider migration. Auth is last and highest risk.
