# CLAUDE.md

Guidance for Claude Code (and any AI agent) working in this repository.

## 0. Language policy (non-negotiable)

**Everything produced in this repository is written in English** — code, identifiers,
comments, docstrings, commit messages, PR titles and descriptions, issue replies,
and documentation. This holds **even when the human writes to you in Spanish or any
other language**: understand the request in their language, but produce all
artifacts in English.

**One deliberate exception**: this project's audience is Spanish-speaking beginner
students, so **user-facing copy actually rendered in the UI** — labels, buttons, form
placeholders, toast/error messages, empty states, and `README.md` itself — is written
in **Spanish**. Everything else (code, identifiers, comments, `MIGRATION.md`, commit
messages, PR text) stays in English. When in doubt: if a string is read by the app's
end user inside the browser, it's Spanish; if it's read by a developer, it's English.

## 1. Project overview

TaskFlow is a task/list manager built as a **single Next.js project** — there is no
separate backend process. It exists to teach beginners the full "vibe coding" loop:
clone a repo, wire up a database, and ship to production, using only `git` and `npm`.

- **Next.js 15** (App Router, `src/` directory convention), **React 19**,
  **TypeScript** in strict mode.
- **Drizzle ORM** with the `@neondatabase/serverless` driver talks to **Neon**
  (serverless Postgres) — `DATABASE_URL` is provided by Neon (locally, from your Neon
  project dashboard; on Vercel, automatically once you add the Neon integration from
  the Marketplace).
- **Zod** validates every input to a Server Action.
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives) for UI.
- **Auth.js v5** (`next-auth`, Credentials provider, JWT session strategy — no
  database adapter, no OAuth) for login/session.
- **Resend** sends the two transactional emails the app needs (email verification,
  password reset).
- **Vercel** is the only deploy target. There is no Docker, no docker-compose, no
  CORS configuration, and no job queue (Celery/Redis) anywhere in this project — a
  Server Action that needs to send one email just `await`s it inline.

See `MIGRATION.md` for the full map of what this project used to be (a FastAPI +
Postgres + Docker Compose monorepo) and where each piece of that ended up, plus the
list of features that were deliberately dropped rather than carried over.

## 2. Commands

Run everything from the repository root — there is only one `package.json`.

```bash
npm install                # install dependencies
npm run dev                 # local dev server (Turbopack)
npm run build                # production build (must pass before opening a PR)
npm run lint                  # eslint (config: eslint.config.mjs)
npm run db:push               # sync src/db/schema.ts to your Neon database directly
npm run db:generate           # generate a versioned migration file under src/db/migrations/
npm run db:studio             # open Drizzle Studio (a GUI over your database)
npm run db:seed               # populate the database with demo data (src/db/seed.ts)
```

> This project requires **Node.js ≥ 20** (shadcn/ui and Tailwind v4's tooling do not
> run on Node 18). A `.nvmrc` pins the exact version used to build this template — run
> `nvm use` if you have `nvm` installed.

> If you add or change a dependency, run `npm install` so `package-lock.json` stays in
> sync, and commit the lockfile in the same change.

## 3. Testing conventions

There is no test framework wired up yet. Add one (and its CI step) only when a task
explicitly calls for it — don't introduce a testing stack speculatively.

## 4. Conventions (follow the existing patterns)

```
src/
├── app/            # App Router routes. Each folder is a URL; page.tsx is a Server
│                   # Component unless marked "use client". The only Route Handler
│                   # in the project is app/api/auth/[...nextauth]/route.ts, required
│                   # by Auth.js — do not add app/api routes for business logic.
├── actions/        # Server Actions. ONE ACTION PER FILE, e.g. create-list.ts.
├── db/             # schema.ts (Drizzle tables + relations), index.ts (the "db"
│                   # client), seed.ts, migrations/ (generated, do not hand-edit).
├── lib/            # validations.ts (all Zod schemas), types.ts (shared types,
│                   # incl. ActionResult), email.ts (Resend), password.ts (bcryptjs).
└── components/     # components/ui/* is shadcn-generated (do not hand-edit; re-run
                    # `npx shadcn@latest add <name>` instead) — everything else is
                    # project components, one subfolder per domain (lists/, tasks/).
```

- **Reads vs writes**: there is no REST/GraphQL API for business logic. Reads are
  direct Drizzle queries inside Server Components (see `src/app/dashboard/page.tsx`).
  Writes are Server Actions under `src/actions/`.
- **Server Actions**: `"use server"` at the top of the file. Accept `input: unknown`
  and re-validate with the matching Zod schema from `src/lib/validations.ts` via
  `.safeParse()` — never trust a typed parameter, a Server Action is a public network
  endpoint regardless of what the calling component already checked. Read the session
  with `auth()` (from `@/auth`) and return `{ success: false, error: "No autenticado" }`
  if there's none. **Enforce ownership** by looking up the row and comparing its
  `userId` (or, for tasks, the parent list's `userId`) to `Number(session.user.id)` —
  never trust an id sent by the client. Call `revalidatePath(...)` on whatever page(s)
  show the affected data. Return the shared `ActionResult` type
  (`src/lib/types.ts`): `{ success: true, message?: string } | { success: false, error: string }`.
- **Schema**: Drizzle `pgTable` in `src/db/schema.ts`, plus `relations()` so Server
  Components can use the relational query API (`db.query.<table>.findFirst({ with: ... })`).
  Timestamps (`updatedAt`) are **not** auto-updated by the database — every Server
  Action that updates a row must set it explicitly (`updatedAt: new Date()`).
  After changing the schema, run `npm run db:push` for local iteration, or
  `npm run db:generate` to also produce a committed migration file.
- **Validation**: every Zod schema lives in `src/lib/validations.ts`, exported
  alongside its inferred TS type (`z.infer<...>`).
- **UI**: reuse `src/components/ui/*` (shadcn) — don't hand-roll a primitive that
  already exists there. Forms use a plain `<form action={...}>` with React 19's
  `useActionState` calling a Server Action directly; there is no react-hook-form in
  this project (shadcn's `form.tsx` was replaced by the framework-agnostic `Field`
  primitives — see `src/components/ui/field.tsx`).

## 5. Auth.js conventions

Auth is split across three files on purpose — **do not collapse them**:

- `src/auth.config.ts` — Edge-safe. No bcryptjs, no `db` import, no Node-only code.
  Just `pages` and an empty `providers: []`.
- `src/auth.ts` — the full config (Node runtime): the Credentials provider (bcryptjs +
  the `db` client), session/JWT callbacks. Exports `handlers`, `auth`, `signIn`,
  `signOut`.
- `src/middleware.ts` — builds its **own**, separate `NextAuth(authConfig)` instance
  from `auth.config.ts` only. It must never import from `./auth` — that would pull
  bcryptjs and the Neon client into the Edge Runtime bundle that middleware runs in,
  which is the single most common Auth.js + Next.js bug. If you touch middleware,
  verify afterwards that nothing from `./auth` leaked in (e.g. grep the built
  `.next/server/edge/chunks/*.js` for `bcrypt`/`neondatabase` — it should find nothing).

`session.user.id` is a string (see the `declare module "next-auth"` / `"next-auth/jwt"`
augmentations at the top of `src/auth.ts`) — `Number(session.user.id)` it before
comparing to a Drizzle integer column.

**Microsoft Entra ID** is a second, optional provider in `src/auth.ts`, registered only
when `AUTH_MICROSOFT_ENTRA_ID_ID`/`_SECRET` are set (see `microsoftEntraIdEnabled`) —
Credentials keeps working either way. There is no database adapter, so an OAuth
sign-in never gets a `users` row for free: the `jwt` callback find-or-creates one by
`email` on first sign-in via Microsoft, specifically so `token.id` ends up being our
local `users.id` (a string) exactly like a Credentials sign-in, and every downstream
Server Action/query stays provider-agnostic. `users.hashedPassword` is nullable for
exactly this reason — guard against `null` before `bcryptjs.compare`. Setup for an org
admin (registering the Azure app, redirect URIs) lives in
`docs/microsoft-entra-id-setup.md`, not here — students never touch Azure.

## 6. Design references for UI issues

When a task should match a specific visual design (a mockup, screenshot, PDF spec, or
HTML prototype), commit the file(s) into the repo under `design/refs/<key>/` rather
than only linking an external URL or GitHub's issue-attachment CDN link.

- Allowed types: `.png`, `.jpg`/`.jpeg`, `.pdf`, `.html`.
- Link the exact path(s) under a `## Design references` section in the issue body —
  this is the **authoritative** pointer agents follow; `design/refs/<issue-number>/`
  is only the default drop location for the common case. See `design/refs/README.md`
  for the full convention.
- Treat a linked reference as the source of truth for visual detail (layout, spacing,
  colors, copy, visible states) over your own interpretation.

## 7. Git & PR conventions

- One issue → one branch (`claude/issue-<n>`) → one Pull Request. Keep changes
  **scoped to the issue**; do not bundle unrelated refactors.
- The PR description must include `Closes #<n>` so merging closes the issue.
- Commit messages and PR text in English, imperative mood (e.g. "Add task priority
  filter"). Conventional-commit prefixes (`feat:`, `fix:`, `chore:`) are welcome.
- Before opening a PR, run `npm run lint` and `npm run build` locally and fix
  anything that fails — do not open a PR with failing checks.
- `main` is protected: nothing merges unless CI passes.

## 8. Secrets

- The real `.env.local` is git-ignored and must never be committed. `.env.example`
  documents every variable the app needs, with comments on where to get a real value.
- Locally: copy `.env.example` to `.env.local` and fill it in with your own Neon,
  Resend, and generated `AUTH_SECRET` values.
- On Vercel: `DATABASE_URL` comes from the Neon Marketplace integration
  automatically; `AUTH_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` must be set by
  hand in Project Settings → Environment Variables.
- In CI, secrets come from **GitHub Secrets**, scoped to the job that needs them.
  Never print secret values to logs.
