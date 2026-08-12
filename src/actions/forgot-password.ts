"use server";

import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { resendEnabled, sendPasswordResetEmail } from "@/lib/email";
import type { ActionResult } from "@/lib/types";
import { forgotPasswordSchema } from "@/lib/validations";

// Same generic message whether or not the email exists, so this endpoint
// never reveals which emails have an account (mirrors the original backend
// on purpose).
const GENERIC_MESSAGE =
  "Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.";

export async function forgotPassword(input: unknown): Promise<ActionResult> {
  // The login page already hides the link to this flow when Resend isn't
  // configured (see src/app/(auth)/login), but guard here too in case
  // someone reaches this action directly: there would be no way to deliver
  // a reset link anyway, so don't bother touching the database.
  if (!resendEnabled) {
    return { success: true, message: GENERIC_MESSAGE };
  }

  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { email } = parsed.data;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!user) {
    return { success: true, message: GENERIC_MESSAGE };
  }

  const resetToken = randomBytes(32).toString("hex");
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  await db
    .update(users)
    .set({ resetToken, resetTokenExpires })
    .where(eq(users.id, user.id));

  await sendPasswordResetEmail(email, resetToken);

  return { success: true, message: GENERIC_MESSAGE };
}
