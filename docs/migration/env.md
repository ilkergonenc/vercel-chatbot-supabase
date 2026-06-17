# Environment variable migration guide

Do not add real secrets to the repository.

## Current env vars

| Variable | Current purpose |
| --- | --- |
| `AUTH_SECRET` | NextAuth JWT/session secret. |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key for non-Vercel deployments. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob upload token. |
| `POSTGRES_URL` | Runtime and migration Postgres connection string. |
| `REDIS_URL` | Redis connection for rate limiting and resumable streams. |

## Target env vars

| Variable | Target purpose |
| --- | --- |
| `OPENAI_API_KEY` | Direct OpenAI provider access through Vercel AI SDK. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for browser and server clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for browser and server SSR auth clients. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional server-only key for trusted admin tasks. Do not expose to browser. |
| `DATABASE_URL` | Runtime Supabase Postgres URL. Usually pooled. |
| `DIRECT_DATABASE_URL` | Migration Supabase Postgres URL. Usually direct or session-pooler. |
| `SUPABASE_STORAGE_BUCKET` | Optional bucket name, default `chat-attachments`. |
| `REDIS_URL` | Keep existing Redis behavior. |

## Remove, replace, keep

| Current variable | Action | Replacement |
| --- | --- | --- |
| `AUTH_SECRET` | Remove in Phase 4 | Supabase Auth cookies/session handling |
| `AI_GATEWAY_API_KEY` | Remove in Phase 1 | `OPENAI_API_KEY` |
| `BLOB_READ_WRITE_TOKEN` | Remove in Phase 3 | Supabase Storage variables |
| `POSTGRES_URL` | Replace or temporarily alias in Phase 2 | `DATABASE_URL`, `DIRECT_DATABASE_URL` |
| `REDIS_URL` | Keep | No change |

## Local development notes

- Use `.env.local` for local secrets.
- Keep old env vars until the phase that removes them has been implemented and verified.
- For Supabase hosted development, use a separate dev project before touching production data.
- For Supabase local development, run the Supabase CLI stack and point `DATABASE_URL` / `DIRECT_DATABASE_URL` at the local Postgres instance.

## Vercel deployment notes

- Configure env vars separately for Preview and Production.
- Do not rely on Vercel AI Gateway OIDC after Phase 1; direct OpenAI requires `OPENAI_API_KEY`.
- Remove Blob integration only after Phase 3 is verified.
- Remove Auth.js secret only after Phase 4 is verified.
- Build-time migrations currently run through `pnpm build` via `tsx lib/db/migrate`; ensure `DIRECT_DATABASE_URL` or equivalent is available in the build environment if migrations still run at build time.

## Supabase local vs hosted notes

- Hosted Supabase provides direct, session pooler, and transaction pooler connection options.
- Local Supabase generally behaves like a normal local Postgres connection.
- Do not mix local and hosted credentials in the same `.env.local`.

## Drizzle migration connection notes

- Runtime serverless connections can use Supabase transaction pooling.
- Drizzle migrations should use a direct connection or session pooler where possible.
- Keep migration execution explicit and observable.
- Existing migration SQL is standard Postgres and should be reusable initially.

## Pooler warning

Supabase transaction pooler does not support prepared statements in the same way as a normal direct connection. When using `postgres` with Drizzle against a transaction pooler URL, configure the runtime client with `prepare: false`.
