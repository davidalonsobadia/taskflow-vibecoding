"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { updateTask } from "@/actions/update-task";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult, Task } from "@/lib/types";
import { optionalFormValue } from "@/lib/utils";

export function EditTaskDialog({ task }: { task: Task }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function action(
    _prevState: ActionResult | null,
    formData: FormData,
  ): Promise<ActionResult> {
    const result = await updateTask({
      id: task.id,
      title: formData.get("title"),
      description: optionalFormValue(formData.get("description")),
      priority: formData.get("priority"),
      dueDate: optionalFormValue(formData.get("dueDate")),
    });

    if (result.success) {
      toast.success(result.message ?? "Tarea actualizada correctamente");
      setOpen(false);
      router.refresh();
    }

    return result;
  }

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Editar tarea">
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar tarea</DialogTitle>
          <DialogDescription>
            Cambia los datos de esta tarea.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`edit-task-title-${task.id}`}>
                Título
              </FieldLabel>
              <Input
                id={`edit-task-title-${task.id}`}
                name="title"
                defaultValue={task.title}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-task-description-${task.id}`}>
                Descripción (opcional)
              </FieldLabel>
              <Textarea
                id={`edit-task-description-${task.id}`}
                name="description"
                defaultValue={task.description ?? ""}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-task-priority-${task.id}`}>
                Prioridad
              </FieldLabel>
              <Select name="priority" defaultValue={task.priority}>
                <SelectTrigger
                  id={`edit-task-priority-${task.id}`}
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-task-due-date-${task.id}`}>
                Fecha límite (opcional)
              </FieldLabel>
              <Input
                id={`edit-task-due-date-${task.id}`}
                name="dueDate"
                type="date"
                defaultValue={task.dueDate ?? ""}
              />
            </Field>
            {state && !state.success && <FieldError>{state.error}</FieldError>}
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
