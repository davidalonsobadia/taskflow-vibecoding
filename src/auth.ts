import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth, { type DefaultSession } from "next-auth";
// This import has no named bindings -- it exists only so TypeScript can
// resolve "next-auth/jwt" as a real module, which the `declare module`
// augmentation below needs in order to merge into it.
import "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "./auth.config";
import { db } from "./db";
import { users } from "./db/schema";
import { loginSchema } from "./lib/validations";

// Module augmentation: makes `session.user.id` (a string) and `token.id`
// known to TypeScript everywhere in the app, instead of `any`.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        // Re-validate the shape here: `credentials` comes in as an
        // untyped record, this is our only guarantee it looks right.
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }
        const { email, password } = parsed.data;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        if (!user) {
          return null;
        }

        if (!user.isVerified) {
          return null;
        }

        const passwordsMatch = await compare(password, user.hashedPassword);
        if (!passwordsMatch) {
          return null;
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only defined right after sign-in; persist its id on the
      // token so it survives on every subsequent request.
      if (user) {
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
});
