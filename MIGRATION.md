# Migration map: FastAPI backend -> Next.js

This document maps every endpoint of the original FastAPI backend
(`backend/app/domains/{auth,lists,tasks}`, since removed -- see git history
before this migration if you need to look at the original source) to where
its behavior now lives in this project. There is no REST API for business
logic anymore: reads are
direct Drizzle queries inside Server Components, writes are Server Actions
under `src/actions/`. The only Route Handler in the whole app is the
mandatory Auth.js catch-all (`src/app/api/auth/[...nextauth]/route.ts`),
which is infrastructure, not a business endpoint.

## Endpoint map

| Original endpoint | v2 location | Notes |
| --- | --- | --- |
| `POST /api/v1/auth/register` | `src/actions/register.ts` -> `register()` | Called from `src/app/(auth)/register/page.tsx`. Hashes the password with `hashPassword()` (`src/lib/password.ts`, bcryptjs), stores a random `verificationToken` on the user row, and sends the verification email via `sendVerificationEmail()` (`src/lib/email.ts`, Resend). |
| `POST /api/v1/auth/login` | `src/actions/login.ts` -> `login()` | Called from `src/app/(auth)/login/page.tsx`. Delegates credential checking to Auth.js's Credentials provider (`src/auth.ts`) via `signIn("credentials", { redirect: false })`; the provider itself checks `isVerified` and compares the password hash. |
| `POST /api/v1/auth/logout` | `src/actions/logout.ts` -> `logout()` | Called from `src/app/dashboard/layout.tsx` (`logoutAndRedirect`). Wraps Auth.js's `signOut({ redirect: false })` -- no server-side session/cookie table to clean up, Auth.js handles the JWT cookie. |
| `GET /api/v1/auth/me` | **Removed.** | No endpoint needed: any Server Component or Server Action that needs the current user calls `auth()` (exported from `src/auth.ts`) directly, e.g. `src/app/dashboard/layout.tsx` and `src/app/dashboard/page.tsx`. |
| `POST /api/v1/auth/verify-email` | `src/actions/verify-email.ts` -> `verifyEmail()` | Called from `src/app/(auth)/verify-email/verify-email-content.tsx`. Looks the user up by `verificationToken`, sets `isVerified = true`, clears the token, and sends a welcome email via `sendWelcomeEmail()`. |
| `POST /api/v1/auth/forgot-password` | `src/actions/forgot-password.ts` -> `forgotPassword()` | Called from `src/app/(auth)/forgot-password/page.tsx`. Keeps the original's privacy behavior: always returns the same generic success message whether or not the email exists. |
| `POST /api/v1/auth/reset-password` | `src/actions/reset-password.ts` -> `resetPassword()` | Called from `src/app/(auth)/reset-password/reset-password-content.tsx`. Validates `resetToken` and its expiry (`resetTokenExpires`), then re-hashes and stores the new password. |
| `GET /api/v1/lists` | **Removed.** | Direct Drizzle query inside `src/app/dashboard/page.tsx` (`DashboardPage`), which also computes per-list task counts (see "Deliberate simplifications" below). |
| `POST /api/v1/lists` | `src/actions/create-list.ts` -> `createList()` | Called from `src/components/lists/create-list-dialog.tsx`. Revalidates `/dashboard` after insert. |
| `GET /api/v1/lists/{id}` | **Removed.** | Direct Drizzle query inside `src/app/dashboard/lists/[id]/page.tsx` (`ListDetailPage`); ownership is checked by comparing `list.userId` to the session user before rendering, returning a 404 (`notFound()`) if it does not match -- same "404, not 403" behavior as the original service. |
| `PUT /api/v1/lists/{id}` | `src/actions/update-list.ts` -> `updateList()` | Called from `src/components/lists/edit-list-dialog.tsx`. Re-checks ownership server-side before writing, independent of what the client sent. |
| `DELETE /api/v1/lists/{id}` | `src/actions/delete-list.ts` -> `deleteList()` | Called from `src/components/lists/delete-list-dialog.tsx`. Relies on the `onDelete: "cascade"` foreign key on `tasks.listId` (`src/db/schema.ts`) to remove the list's tasks -- no manual cleanup needed. |
| `GET /api/v1/tasks` (`?list_id=`) | **Removed.** | Direct Drizzle query inside `src/app/dashboard/lists/[id]/page.tsx`, split client-side into pending/completed sections. The original's extra filter query params (`completed`, `priority`, `due_after`, `due_before`, `overdue`) have no v2 equivalent -- the list detail page always shows all of a list's tasks. |
| `GET /api/v1/tasks/{id}` | **Removed.** | v2 has no standalone single-task view -- every task is always rendered inline within its list's page (`src/components/tasks/task-item.tsx`), so nothing ever needs to fetch one task by id outside that context. |
| `POST /api/v1/tasks` | `src/actions/create-task.ts` -> `createTask()` | Called from `src/components/tasks/create-task-dialog.tsx`. Verifies the target list belongs to the current user before inserting. Revalidates `/dashboard/lists/{listId}`. |
| `PUT /api/v1/tasks/{id}` | `src/actions/update-task.ts` -> `updateTask()` | Called from `src/components/tasks/edit-task-dialog.tsx` and from the completion checkbox in `src/components/tasks/task-item.tsx`. Ownership is checked through the parent list (`db.query.tasks.findFirst({ with: { list: true } })`), since tasks have no `userId` of their own. |
| `DELETE /api/v1/tasks/{id}` | `src/actions/delete-task.ts` -> `deleteTask()` | Called from `src/components/tasks/delete-task-dialog.tsx`. Same ownership check as `updateTask()`. |

## Deliberate simplifications

- **Dropped the `api_clients` domain and the `x-api-key` gateway middleware.**
  That gateway existed to protect a standalone backend process from being
  called directly by anything other than the app's own frontend. In v2
  there is no separate backend process to protect: Server Actions run
  inside the same Next.js deployment as the UI that calls them, and are
  never exposed as callable HTTP endpoints in the first place.

- **Dropped the whole Celery + Redis + Docker + nginx stack.** The only
  background job the original app ever queued was sending a single
  transactional email. On Vercel, a Server Action can call Resend directly
  and `await` it inline -- there is no job volume or latency profile here
  that justifies a broker, a worker process, or the containers needed to
  run them.

- **Dropped the half-implemented task-recurrence feature entirely.** The
  original `tasks` table had a `recurrence` enum and a self-referencing
  `parent_task_id` column, but no code anywhere ever generated a recurring
  task's next occurrence -- the columns were pure dead weight. v2's `tasks`
  table (`src/db/schema.ts`) has neither column and neither concept; it can
  be reintroduced later as a real feature if needed, without dragging along
  a half-built version of it.

- **Dropped the orphaned duplicate frontend route tree.** The original
  frontend had two parallel list-detail flows: `app/dashboard/lists/[id]`
  and a second, unlinked `app/lists/[id]` (with its own `app/lists/page.tsx`
  sidebar). Only the `/dashboard` tree was reachable from the app's actual
  navigation; `/lists` was leftover from an earlier iteration. v2 keeps only
  the canonical flow: `src/app/dashboard/page.tsx` (list overview) and
  `src/app/dashboard/lists/[id]/page.tsx` (list detail) -- there is exactly
  one way to reach a list's tasks.

- **Actually implemented per-list task/completed counts.** The original
  `ListsService` hardcoded `task_count=0` and `completed_count=0` on every
  response with a `# TODO: Add task counting when Task model exists`
  comment -- it was never finished even though the `Task` model existed by
  then. v2's `src/app/dashboard/page.tsx` computes both counts for real,
  in one query, with a `LEFT JOIN` plus `count()` /
  `count(CASE WHEN tasks.completed THEN 1 END)` grouped by list, so
  `src/components/lists/list-card.tsx` can show real progress
  ("3 de 5 tareas completadas") instead of a permanent zero.
