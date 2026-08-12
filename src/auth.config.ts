import type { NextAuthConfig } from "next-auth";

// This file must stay Edge-safe: no bcryptjs, no Drizzle/db client, nothing
// Node-only. It is imported both by `src/auth.ts` (Node runtime, full config)
// and by `src/middleware.ts` (Edge runtime). The Credentials provider needs
// bcryptjs and the database, so it is added later in `src/auth.ts`, never
// here -- that split is what keeps Node-only code out of the Edge bundle.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
};
