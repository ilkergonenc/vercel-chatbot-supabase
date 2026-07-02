# Database

The application data layer is Drizzle ORM over Postgres. Supabase Postgres is the current Postgres provider.

## Environment variables

- `DATABASE_URL`: runtime Postgres URL. Supabase pooled URLs are supported.
- `DIRECT_DATABASE_URL`: direct or session-pooler URL for Drizzle migrations.
- `POSTGRES_URL`: legacy fallback still present in code for compatibility, not the preferred variable for new setup.

Do not add secrets to documentation. Use `.env.example` for variable names only.

## Code paths

- Schema: `lib/db/schema.ts`
- Runtime queries: `lib/db/queries.ts`
- Migration runner: `lib/db/migrate.ts`
- Drizzle config: `drizzle.config.ts`
- Migrations: `lib/db/migrations/`

## Rules

- Keep Drizzle as the app data layer unless the user explicitly asks otherwise.
- Do not rename existing tables as part of routine cleanup.
- Do not run migrations unless explicitly requested.
- Do not modify production data.
- Keep Supabase Auth user IDs mapped to app-owned profile/user rows through the existing helpers.
