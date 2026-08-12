import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

// Create the Resend client lazily, the first time an email is actually sent,
// instead of at module load time. The Resend constructor throws if
// RESEND_API_KEY is missing, and this file is imported (transitively, via the
// auth Server Actions) by pages that Next.js pre-renders at *build* time --
// creating the client eagerly would make `next build` fail whenever
// RESEND_API_KEY isn't set, even though it's only really needed at runtime.
let resend: Resend | undefined;

function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Builds the public base URL of the app, in order of preference:
// 1. NEXT_PUBLIC_APP_URL, set explicitly (e.g. in `.env.local` or on Vercel).
// 2. VERCEL_URL, which Vercel sets automatically at runtime (no "https://").
// 3. localhost, for local development.
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export async function sendVerificationEmail(
  to: string,
  token: string,
): Promise<void> {
  const link = `${getBaseUrl()}/verify-email?token=${token}`;

  await getResendClient().emails.send({
    from: FROM_EMAIL!,
    to,
    subject: "Confirma tu cuenta de TaskFlow",
    html: `
      <p>¡Gracias por registrarte en TaskFlow!</p>
      <p>Confirma tu cuenta haciendo clic en el siguiente enlace:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Si no has creado esta cuenta, puedes ignorar este email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
): Promise<void> {
  const link = `${getBaseUrl()}/reset-password?token=${token}`;

  await getResendClient().emails.send({
    from: FROM_EMAIL!,
    to,
    subject: "Recupera tu contraseña de TaskFlow",
    html: `
      <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña (caduca en 1 hora):</p>
      <p><a href="${link}">${link}</a></p>
      <p>Si no has solicitado esto, puedes ignorar este email.</p>
    `,
  });
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
): Promise<void> {
  await getResendClient().emails.send({
    from: FROM_EMAIL!,
    to,
    subject: "¡Bienvenido/a a TaskFlow!",
    html: `
      <p>Hola ${name},</p>
      <p>Tu cuenta ha sido verificada correctamente. ¡Ya puedes empezar a organizar tus tareas!</p>
    `,
  });
}
