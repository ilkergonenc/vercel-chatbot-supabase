# Supabase Postgres and Drizzle migration plan

Do not implement database connection changes until Phase 2.

## Current DB schema

Defined in `lib/db/schema.ts`:

- `"User"`
  - App user table with email, password, profile fields, anonymous flag, timestamps.
- `"Chat"`
  - Chat metadata, owner `userId`, title, visibility.
- `"Message_v2"`
  - Chat messages with AI SDK parts and attachments as JSON.
- `"Vote_v2"`
  - Composite key vote table.
- `"Document"`
  - Versioned artifact documents with composite primary key `(id, createdAt)`.
- `"Suggestion"`
  - Suggestions tied to document versions.
- `"Stream"`
  - Resumable stream IDs per chat.

## Current Drizzle setup

- `drizzle.config.ts`
  - Uses `schema: "./lib/db/schema.ts"`.
  - Outputs migrations to `./lib/db/migrations`.
  - Reads `DIRECT_DATABASE_URL`, then `DATABASE_URL`, then `POSTGRES_URL`.
- `lib/db/queries.ts`
  - Creates `postgres(process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "", { prepare: false })`.
  - Wraps it with `drizzle(client)`.
  - Exports all app query helpers.
- `lib/db/migrate.ts`
  - Loads `.env.local`.
  - Skips if no database URL is defined.
  - Runs migrations from `./lib/db/migrations`.

## Current migration setup

- Existing migration: `lib/db/migrations/0000_initial.sql`
- Migration SQL is standard Postgres and uses `gen_random_uuid()`.
- The migration should be reusable on Supabase Postgres in the first DB phase.

## Recommended Supabase connection strategy

- Keep Drizzle and `postgres`.
- Use `DATABASE_URL` for runtime app queries.
- Use `DIRECT_DATABASE_URL` for migrations.
- Keep `POSTGRES_URL` as a temporary fallback during transition.

Runtime:

- Runtime config uses `postgres(url, { prepare: false })` for Supabase transaction pooler compatibility.
- Keep query helpers centralized.

Migrations:

- Prefer direct connection or session pooler.
- Avoid transaction pooler for migrations where possible.

## Runtime connection vs migration connection

| Use | Recommended variable | Notes |
| --- | --- | --- |
| App runtime | `DATABASE_URL` | Pooled URL is acceptable with `prepare: false`. |
| Drizzle migrations | `DIRECT_DATABASE_URL` | Direct/session connection is safer. |
| Local Supabase | `DATABASE_URL` and `DIRECT_DATABASE_URL` may match | Keep explicit for parity. |

## Can existing migrations be reused?

Yes, initially.

Do not rename tables or reshape the app data model in Phase 2. Later Auth migration may add a migration to map `"User".id` to Supabase `auth.users.id`, but that belongs to Phase 4.

## Pooler notes

Supabase transaction pooling can break prepared statements. Use:

```ts
postgres(url, { prepare: false })
```

for runtime if using a transaction pooler URL.

## Verification commands

- `pnpm db:migrate`
- `pnpm check`
- `pnpm build`
- PowerShell E2E: `$env:PLAYWRIGHT='True'; pnpm exec playwright test`

Also manually verify:

- Create chat.
- Reload and read chat history.
- Delete chat.
- Create document artifact.
- Fetch suggestions if applicable.

## Rollback strategy

- Keep the old database untouched until Supabase runtime is verified.
- Restore previous `POSTGRES_URL` usage if needed.
- Roll back only the connection/env changes before touching schema changes.
- Do not run destructive migrations against production during first cutover.
