import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// The drizzle-kit CLI does NOT automatically load ".env.local" the way the
// Next.js dev server does, so we load it explicitly here. This is a common
// beginner gotcha: if you forget this, `process.env.DATABASE_URL` is
// undefined when you run `npm run db:generate` / `db:push` / `db:studio`.
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Create a '.env.local' file at the project root " +
      "with a line like:\n\n" +
      "  DATABASE_URL=postgresql://user:password@host/dbname\n\n" +
      "You can get a free Postgres database at https://neon.tech and copy its " +
      "connection string here.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
