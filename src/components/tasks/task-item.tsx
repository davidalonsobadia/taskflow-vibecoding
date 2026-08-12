"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateTask } from "@/actions/update-task";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

import { DeleteTaskDialog } from "./delete-task-dialog";
import { EditTaskDialog } from "./edit-task-dialog";

const PRIORITY_LABELS: Record<Task["priority"], string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const PRIORITY_VARIANTS: Record<
  Task["priority"],
  "secondary" | "default" | "destructive"
> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

// `task.dueDate` is stored as a plain "YYYY-MM-DD" string (see schema.ts), so
// this just rearranges the pieces -- no Date object / timezone involved.
function formatDueDate(dueDate: string): string {
  const [year, month, day] = dueDate.split("-");
  return `${day}/${month}/${year}`;
}

export function TaskItem({ task }: { task: Task }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleToggle(checked: boolean) {
    setIsPending(true);
    const result = await updateTask({ id: task.id, completed: checked });
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <li className="flex items-start gap-3 rounded-lg border p-3">
      <Checkbox
        checked={task.completed}
        disabled={isPending}
        onCheckedChange={(checked) => handleToggle(checked === true)}
        aria-label={
          task.completed ? "Marcar como pendiente" : "Marcar como completada"
        }
        className="mt-1"
      />
      <div className="flex-1 space-y-1">
        <p
          className={cn(
            "text-sm font-medium",
            task.completed && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={PRIORITY_VARIANTS[task.priority]}>
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          {task.dueDate && (
            <span className="text-xs text-muted-foreground">
              Vence: {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <EditTaskDialog task={task} />
        <DeleteTaskDialog task={task} />
      </div>
    </li>
  );
}
