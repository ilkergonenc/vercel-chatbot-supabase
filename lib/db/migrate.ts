import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({
  path: ".env.local",
});

const isHarmlessDrizzleMigrationNotice = (notice: postgres.Notice) =>
  (notice.code === "42P06" &&
    notice.message === 'schema "drizzle" already exists, skipping') ||
  (notice.code === "42P07" &&
    notice.message ===
      'relation "__drizzle_migrations" already exists, skipping');

const runMigrate = async () => {
  const databaseUrl =
    process.env.DIRECT_DATABASE_URL ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL;

  if (!databaseUrl) {
    console.log("No database URL defined, skipping migrations");
    process.exit(0);
  }

  const connection = postgres(databaseUrl, {
    max: 1,
    onnotice: (notice) => {
      if (isHarmlessDrizzleMigrationNotice(notice)) {
        return;
      }

      console.log(notice);
    },
  });
  const db = drizzle(connection);

  console.log("Running migrations...");

  const start = Date.now();
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  const end = Date.now();

  console.log("Migrations completed in", end - start, "ms");
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("Migration failed");
  console.error(err);
  process.exit(1);
});
