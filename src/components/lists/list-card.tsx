import Link from "next/link";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { List } from "@/lib/types";

import { DeleteListDialog } from "./delete-list-dialog";
import { EditListDialog } from "./edit-list-dialog";

interface ListCardProps {
  list: List;
  taskCount: number;
  completedCount: number;
}

export function ListCard({ list, taskCount, completedCount }: ListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: list.color }}
          />
          <Link href={`/dashboard/lists/${list.id}`} className="hover:underline">
            {list.name}
          </Link>
        </CardTitle>
        {list.description && (
          <CardDescription>{list.description}</CardDescription>
        )}
        <CardAction className="flex gap-1">
          <EditListDialog list={list} />
          <DeleteListDialog list={list} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {taskCount === 0
            ? "Sin tareas todavía"
            : `${completedCount} de ${taskCount} tareas completadas`}
        </p>
      </CardContent>
    </Card>
  );
}
