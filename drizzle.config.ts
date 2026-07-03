import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({
  path: '.env.local',
})

const databaseUrl =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? ''

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
