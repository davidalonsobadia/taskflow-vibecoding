"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { lists, tasks } from "@/db/schema";
import type { ActionResult } from "@/lib/types";
import { createTaskSchema } from "@/lib/validations";

// Base route of the list detail page. Task mutations only ever need to
// revalidate the one list they belong to, not the whole dashboard.
const LIST_DETAIL_BASE_PATH = "/dashboard/lists";

export async function createTask(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { listId, ...taskFields } = parsed.data;

  // Never trust `listId` from the client: check it actually belongs to the
  // logged-in user before inserting a task under it.
  const list = await db.query.lists.findFirst({
    where: eq(lists.id, listId),
  });
  if (!list || list.userId !== Number(session.user.id)) {
    return { success: false, error: "No autorizado" };
  }

  await db.insert(tasks).values({
    ...taskFields,
    listId,
  });

  revalidatePath(`${LIST_DETAIL_BASE_PATH}/${listId}`);

  return { success: true, message: "Tarea creada correctamente" };
}
