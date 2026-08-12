import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth, { type DefaultSession } from "next-auth";
// This import has no named bindings -- it exists only so TypeScript can
// resolve "next-auth/jwt" as a real module, which the `declare module`
// augmentation below needs in order to merge into it.
import "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

import { authConfig } from "./auth.config";
import { db } from "./db";
import { users } from "./db/schema";
import { loginSchema } from "./lib/validations";

// Microsoft Entra ID is entirely OPTIONAL: it's only added to `providers`
// below when these are set, so a deployment that never configures it keeps
// working with email+password only -- see docs/microsoft-entra-id-setup.md
// for how an org admin registers the app in Azure and hands out these 3
// values (this project never asks a student to open the Azure portal).
const microsoftEntraIdEnabled = Boolean(
  process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
);

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

        // A user created via Microsoft sign-in has no local password --
        // there is nothing to compare against, so Credentials login must
        // fail for them (they should use the "Sign in with Microsoft"
        // button instead).
        if (!user.hashedPassword) {
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
    // Only registered when an org admin has configured it (see the
    // `microsoftEntraIdEnabled` check above). `issuer` restricts sign-in to
    // one specific Entra tenant -- omitting it would default to "common"
    // and let ANY Microsoft account in, which is not what we want here.
    ...(microsoftEntraIdEnabled
      ? [
          MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // `user`/`account` are only defined right after sign-in.
      if (user && account?.provider === "microsoft-entra-id") {
        // There is no database adapter in this project (see CLAUDE.md), so
        // Auth.js never creates a `users` row for an OAuth sign-in by
        // itself -- `user.id` here is Microsoft's own identifier, not one
        // of our integer primary keys. Find-or-create the local row by
        // email so lists/tasks can reference a stable `users.id`, exactly
        // like an email+password account.
        if (!user.email) {
          throw new Error(
            "Microsoft did not return an email address for this account",
          );
        }
        let dbUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });
        if (!dbUser) {
          [dbUser] = await db
            .insert(users)
            .values({
              name: user.name ?? user.email,
              email: user.email,
              // Microsoft already verified this identity, and there is no
              // local password to set.
              isVerified: true,
            })
            .returning();
        }
        token.id = String(dbUser.id);
      } else if (user) {
        // Credentials sign-in: `user.id` is already our local `users.id`
        // (see `authorize()` above).
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
