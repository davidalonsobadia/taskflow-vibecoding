"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { lists } from "@/db/schema";
import type { ActionResult } from "@/lib/types";
import { createListSchema } from "@/lib/validations";

export async function createList(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  const parsed = createListSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  await db.insert(lists).values({
    ...parsed.data,
    userId: Number(session.user.id),
  });

  // The dashboard page lists every list for the current user, so it must
  // refetch after a new one is created.
  revalidatePath("/dashboard");

  return { success: true, message: "Lista creada correctamente" };
}
