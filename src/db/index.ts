import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to your '.env.local' file, e.g.:\n\n" +
      "  DATABASE_URL=postgresql://user:password@host/dbname\n\n" +
      "You can get a free Postgres database at https://neon.tech.",
  );
}

const sql = neon(process.env.DATABASE_URL);

// Passing `schema` here is what lets Server Components use the Drizzle
// relational query API (e.g. `db.query.lists.findMany({ with: { tasks: true } })`).
export const db = drizzle(sql, { schema });
