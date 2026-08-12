# Setting up "Sign in with Microsoft" (Microsoft Entra ID)

This is for whoever administers the organization's Microsoft Entra ID
(Azure AD) tenant — **not** for students. Students never open the Azure
portal: they just paste three values you hand them into their own
`.env.local` (or their Vercel project's environment variables), and a "Sign
in with Microsoft" button appears on `/login`. Leave the three env vars
unset and the app works exactly as before, with email+password only —
this feature is entirely optional per project.

Why one App Registration for everyone, instead of one per student: Entra App
Registrations require tenant-admin-adjacent permissions most students won't
have, and registering an app in the Azure portal is real friction compared
to signing up for Neon or Resend. A single, centrally-managed registration
means students never touch Azure at all.

## 1. Register the app in Entra ID

1. Go to [portal.azure.com](https://portal.azure.com) → **Microsoft Entra
   ID** → **App registrations** → **New registration**.
2. Name it something recognizable (e.g. "TaskFlow student projects").
3. **Supported account types**: "Accounts in this organizational directory
   only" — this is what restricts sign-in to your tenant. (Do not pick a
   multi-tenant or personal-account option; that would let anyone with a
   Microsoft account sign in to every student's app.)
4. **Redirect URI**: type "Web". You'll come back to add one URI per student
   deployment (see step 4) — for now, add just your own local dev URL to
   verify it works:
   `http://localhost:3000/api/auth/callback/microsoft-entra-id`
5. Click **Register**.

## 2. Collect the 3 values students need

On the app's **Overview** page:

- **Application (client) ID** → this is `AUTH_MICROSOFT_ENTRA_ID_ID`.
- **Directory (tenant) ID** → build the issuer URL from it:
  `AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0`

Then go to **Certificates & secrets** → **New client secret** → copy its
**Value** immediately (it's only shown once) → this is
`AUTH_MICROSOFT_ENTRA_ID_SECRET`.

Hand these 3 values to a student (Slack, email, whatever internal channel
you use) — they paste them into `.env.local` locally and into their Vercel
project's environment variables for production. No API permissions beyond
the defaults (`openid`, `profile`, `email`, `User.Read`) are required — this
is sign-in only, not calling Microsoft Graph on the app's behalf.

## 3. Add a redirect URI per deployment (ongoing)

Every place a student's app runs needs its own entry under **Authentication**
→ **Redirect URIs** on this same App Registration, in the exact form
Auth.js expects:

```
https://<their-domain>/api/auth/callback/microsoft-entra-id
```

In practice that's **two** URIs per student:

- Local dev: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
- Their Vercel production domain: `https://<their-project>.vercel.app/api/auth/callback/microsoft-entra-id`

This is the one recurring maintenance task with this setup: each new
student (or each time a student's Vercel domain changes) means coming back
here to add a URI. Missing one just makes Microsoft show a
"redirect_uri_mismatch" error at sign-in — nothing breaks silently.

## 4. What this does NOT change

- Email+password sign-up/login/verification/password-reset keep working
  exactly as before — this is an *additional* sign-in option, not a
  replacement (see `MIGRATION.md` if that ever needs revisiting).
- A student who signs in with Microsoft still gets a normal row in this
  project's own `users` table (created on their first Microsoft sign-in --
  see the `jwt` callback in `src/auth.ts`), so lists and tasks work exactly
  the same regardless of which method someone used to log in. There's no
  Entra-specific code anywhere outside `src/auth.ts` and the login page.
