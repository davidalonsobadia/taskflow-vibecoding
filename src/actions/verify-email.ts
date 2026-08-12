"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { sendWelcomeEmail } from "@/lib/email";
import type { ActionResult } from "@/lib/types";
import { verifyEmailSchema } from "@/lib/validations";

export async function verifyEmail(input: unknown): Promise<ActionResult> {
  const parsed = verifyEmailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Token inválido",
    };
  }

  const { token } = parsed.data;

  const user = await db.query.users.findFirst({
    where: eq(users.verificationToken, token),
  });
  if (!user) {
    return { success: false, error: "Token de verificación inválido" };
  }

  await db
    .update(users)
    .set({ isVerified: true, verificationToken: null })
    .where(eq(users.id, user.id));

  await sendWelcomeEmail(user.email, user.name);

  return { success: true, message: "Cuenta verificada correctamente" };
}
