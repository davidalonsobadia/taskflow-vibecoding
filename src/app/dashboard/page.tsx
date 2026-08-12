import { count, desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CreateListDialog } from "@/components/lists/create-list-dialog";
import { ListCard } from "@/components/lists/list-card";
import { db } from "@/db";
import { lists, tasks } from "@/db/schema";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = Number(session.user.id);

  // One query that fetches every list for this user together with its task
  // counts, grouped by list. `lists.id` is the primary key of `lists`, so
  // Postgres lets us select the other `lists.*` columns alongside the
  // aggregates without listing them all in GROUP BY.
  const listsWithCounts = await db
    .select({
      id: lists.id,
      name: lists.name,
      color: lists.color,
      description: lists.description,
      userId: lists.userId,
      createdAt: lists.createdAt,
      updatedAt: lists.updatedAt,
      taskCount: count(tasks.id),
      completedCount: count(sql`CASE WHEN ${tasks.completed} THEN 1 END`),
    })
    .from(lists)
    .leftJoin(tasks, eq(tasks.listId, lists.id))
    .where(eq(lists.userId, userId))
    .groupBy(lists.id)
    .orderBy(desc(lists.createdAt));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Mis listas</h1>
          <p className="text-sm text-muted-foreground">
            Organiza tus tareas agrupándolas en listas.
          </p>
        </div>
        <CreateListDialog />
      </div>

      {listsWithCounts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Todavía no tienes listas. Crea la primera para empezar a
            organizar tus tareas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listsWithCounts.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              taskCount={list.taskCount}
              completedCount={list.completedCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
