import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { auth } from "@/auth";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TaskItem } from "@/components/tasks/task-item";
import { db } from "@/db";
import { lists, tasks } from "@/db/schema";

interface ListDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListDetailPage({
  params,
}: ListDetailPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = Number(session.user.id);

  const { id } = await params;
  const listId = Number(id);
  if (!Number.isInteger(listId)) {
    notFound();
  }

  const list = await db.query.lists.findFirst({
    where: eq(lists.id, listId),
  });
  // Same rule the original API enforced: a list that doesn't exist and a
  // list that exists but belongs to someone else look identical (404) to
  // the current user.
  if (!list || list.userId !== userId) {
    notFound();
  }

  const listTasks = await db.query.tasks.findMany({
    where: eq(tasks.listId, listId),
    orderBy: (fields, { asc }) => [asc(fields.createdAt)],
  });

  const pendingTasks = listTasks.filter((task) => !task.completed);
  const completedTasks = listTasks.filter((task) => task.completed);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeftIcon className="size-4" />
        Volver a mis listas
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold">
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: list.color }}
            />
            {list.name}
          </h1>
          {list.description && (
            <p className="text-sm text-muted-foreground">
              {list.description}
            </p>
          )}
        </div>
        <CreateTaskDialog listId={list.id} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">Pendientes</h2>
        {pendingTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay tareas pendientes en esta lista.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pendingTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">Completadas</h2>
        {completedTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no has completado ninguna tarea en esta lista.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
