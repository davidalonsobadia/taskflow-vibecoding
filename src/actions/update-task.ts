"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import type { ActionResult } from "@/lib/types";
import { updateTaskSchema } from "@/lib/validations";

// Base route of the list detail page. Task mutations only ever need to
// revalidate the one list they belong to, not the whole dashboard.
const LIST_DETAIL_BASE_PATH = "/dashboard/lists";

// Same fields as updateTaskSchema (all optional), plus the id of the task
// to update.
const updateTaskInputSchema = updateTaskSchema.extend({
  id: z.number().int().positive("id debe ser un entero positivo"),
});

export async function updateTask(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  const parsed = updateTaskInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { id, ...fields } = parsed.data;

  // Tasks have no userId of their own, so ownership is checked through the
  // parent list: fetch the task together with its list, then compare.
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, id),
    with: { list: true },
  });
  if (!task || task.list.userId !== Number(session.user.id)) {
    return { success: false, error: "No autorizado" };
  }

  await db
    .update(tasks)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(tasks.id, id));

  revalidatePath(`${LIST_DETAIL_BASE_PATH}/${task.listId}`);

  return { success: true, message: "Tarea actualizada correctamente" };
}
