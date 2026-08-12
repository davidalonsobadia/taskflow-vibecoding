"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/db";
import { lists } from "@/db/schema";
import type { ActionResult } from "@/lib/types";

const deleteListInputSchema = z.object({
  id: z.number().int().positive("id debe ser un entero positivo"),
});

export async function deleteList(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  const parsed = deleteListInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { id } = parsed.data;

  const list = await db.query.lists.findFirst({
    where: eq(lists.id, id),
  });
  if (!list || list.userId !== Number(session.user.id)) {
    return { success: false, error: "No autorizado" };
  }

  // Every task under this list is removed automatically by the database via
  // the `onDelete: "cascade"` foreign key on tasks.listId -- no need to
  // delete tasks by hand here.
  await db.delete(lists).where(eq(lists.id, id));

  revalidatePath("/dashboard");

  return { success: true, message: "Lista eliminada correctamente" };
}
