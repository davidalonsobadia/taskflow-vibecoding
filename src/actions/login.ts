"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import type { ActionResult } from "@/lib/types";
import { loginSchema } from "@/lib/validations";

export async function login(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  try {
    // `redirect: false` makes `signIn` return instead of redirecting, so the
    // calling client component decides what happens next (e.g. navigate to
    // /dashboard only after showing a success state).
    await signIn("credentials", {
      ...parsed.data,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Email o contraseña incorrectos, o cuenta no verificada",
      };
    }
    throw error;
  }

  return { success: true };
}
