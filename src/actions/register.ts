"use server";

import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { resendEnabled, sendVerificationEmail } from "@/lib/email";
import { hashPassword } from "@/lib/password";
import type { ActionResult } from "@/lib/types";
import { registerSchema } from "@/lib/validations";

export async function register(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existingUser) {
    return { success: false, error: "Ya existe una cuenta con este email" };
  }

  const hashedPassword = await hashPassword(password);

  // Without Resend configured, there's no way to deliver a verification
  // link, so there's nothing to gate login on: verify the account right
  // away instead of leaving it stuck in a state nobody can get out of.
  if (!resendEnabled) {
    await db.insert(users).values({
      name,
      email,
      hashedPassword,
      isVerified: true,
    });

    return {
      success: true,
      message: "Cuenta creada. Ya puedes iniciar sesión.",
    };
  }

  // A random token the user proves ownership of the email with, by clicking
  // the link we send to it.
  const verificationToken = randomBytes(32).toString("hex");

  await db.insert(users).values({
    name,
    email,
    hashedPassword,
    isVerified: false,
    verificationToken,
  });

  await sendVerificationEmail(email, verificationToken);

  return {
    success: true,
    message:
      "Cuenta creada. Revisa tu email para verificar tu cuenta antes de iniciar sesión.",
  };
}
