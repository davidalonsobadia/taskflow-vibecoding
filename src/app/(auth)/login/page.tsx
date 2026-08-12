import { LoginForm } from "./login-form";

export default function LoginPage() {
  // Checked on the server so the "Sign in with Microsoft" button only ever
  // renders when an org admin has actually configured it (see
  // docs/microsoft-entra-id-setup.md) -- the client never needs to know why
  // it's missing.
  const microsoftEnabled = Boolean(
    process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
      process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET
  );

  return <LoginForm microsoftEnabled={microsoftEnabled} />;
}
