"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { updateList } from "@/actions/update-list";
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
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult, List } from "@/lib/types";
import { optionalFormValue } from "@/lib/utils";

export function EditListDialog({ list }: { list: List }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function action(
    _prevState: ActionResult | null,
    formData: FormData,
  ): Promise<ActionResult> {
    const result = await updateList({
      id: list.id,
      name: formData.get("name"),
      color: optionalFormValue(formData.get("color")),
      description: optionalFormValue(formData.get("description")),
    });

    if (result.success) {
      toast.success(result.message ?? "Lista actualizada correctamente");
      setOpen(false);
      router.refresh();
    }

    return result;
  }

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Editar lista">
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar lista</DialogTitle>
          <DialogDescription>
            Cambia el nombre, el color o la descripción de esta lista.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`edit-list-name-${list.id}`}>
                Nombre
              </FieldLabel>
              <Input
                id={`edit-list-name-${list.id}`}
                name="name"
                defaultValue={list.name}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-list-color-${list.id}`}>
                Color
              </FieldLabel>
              <Input
                id={`edit-list-color-${list.id}`}
                name="color"
                type="color"
                defaultValue={list.color}
                className="h-8 w-16 p-1"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-list-description-${list.id}`}>
                Descripción (opcional)
              </FieldLabel>
              <Textarea
                id={`edit-list-description-${list.id}`}
                name="description"
                defaultValue={list.description ?? ""}
                placeholder="¿De qué trata esta lista?"
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
