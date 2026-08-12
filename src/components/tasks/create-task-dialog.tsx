"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createTask } from "@/actions/create-task";
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
import type { ActionResult } from "@/lib/types";
import { optionalFormValue } from "@/lib/utils";

export function CreateTaskDialog({ listId }: { listId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function action(
    _prevState: ActionResult | null,
    formData: FormData,
  ): Promise<ActionResult> {
    const result = await createTask({
      listId,
      title: formData.get("title"),
      description: optionalFormValue(formData.get("description")),
      priority: formData.get("priority"),
      dueDate: optionalFormValue(formData.get("dueDate")),
    });

    if (result.success) {
      toast.success(result.message ?? "Tarea creada correctamente");
      setOpen(false);
      router.refresh();
    }

    return result;
  }

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Crear tarea
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear tarea</DialogTitle>
          <DialogDescription>
            Añade una nueva tarea a esta lista.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="create-task-title">Título</FieldLabel>
              <Input
                id="create-task-title"
                name="title"
                placeholder="p. ej. Terminar el informe"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-task-description">
                Descripción (opcional)
              </FieldLabel>
              <Textarea id="create-task-description" name="description" />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-task-priority">Prioridad</FieldLabel>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger id="create-task-priority" className="w-full">
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
              <FieldLabel htmlFor="create-task-due-date">
                Fecha límite (opcional)
              </FieldLabel>
              <Input id="create-task-due-date" name="dueDate" type="date" />
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
              {isPending ? "Creando..." : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
