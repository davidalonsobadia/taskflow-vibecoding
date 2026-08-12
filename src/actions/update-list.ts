"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/db";
import { lists } from "@/db/schema";
import type { ActionResult } from "@/lib/types";
import { updateListSchema } from "@/lib/validations";

// Same fields as updateListSchema (all optional), plus the id of the list
// to update.
const updateListInputSchema = updateListSchema.extend({
  id: z.number().int().positive("id debe ser un entero positivo"),
});

export async function updateList(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  const parsed = updateListInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { id, ...fields } = parsed.data;

  // Never trust that the caller owns this list just because they sent its
  // id -- look it up and compare userId before touching anything.
  const list = await db.query.lists.findFirst({
    where: eq(lists.id, id),
  });
  if (!list || list.userId !== Number(session.user.id)) {
    return { success: false, error: "No autorizado" };
  }

  await db
    .update(lists)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(lists.id, id));

  revalidatePath("/dashboard");

  return { success: true, message: "Lista actualizada correctamente" };
}
