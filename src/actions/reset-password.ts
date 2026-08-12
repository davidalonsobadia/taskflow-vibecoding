"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import type { ActionResult } from "@/lib/types";
import { resetPasswordSchema } from "@/lib/validations";

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { token, newPassword } = parsed.data;

  const user = await db.query.users.findFirst({
    where: eq(users.resetToken, token),
  });
  if (!user) {
    return { success: false, error: "Token de recuperación inválido" };
  }

  if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    return { success: false, error: "El enlace de recuperación ha caducado" };
  }

  const hashedPassword = await hashPassword(newPassword);

  await db
    .update(users)
    .set({
      hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    })
    .where(eq(users.id, user.id));

  return { success: true, message: "Contraseña actualizada correctamente" };
}
