"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createList } from "@/actions/create-list";
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
import type { ActionResult } from "@/lib/types";
import { optionalFormValue } from "@/lib/utils";

const DEFAULT_COLOR = "#dc2626";

export function CreateListDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function action(
    _prevState: ActionResult | null,
    formData: FormData,
  ): Promise<ActionResult> {
    const result = await createList({
      name: formData.get("name"),
      color: optionalFormValue(formData.get("color")),
      description: optionalFormValue(formData.get("description")),
    });

    if (result.success) {
      toast.success(result.message ?? "Lista creada correctamente");
      setOpen(false);
      router.refresh();
    }

    return result;
  }

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Crear lista
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear lista</DialogTitle>
          <DialogDescription>
            Organiza tus tareas agrupándolas en una nueva lista.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="create-list-name">Nombre</FieldLabel>
              <Input
                id="create-list-name"
                name="name"
                placeholder="p. ej. Estudios"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-list-color">Color</FieldLabel>
              <Input
                id="create-list-color"
                name="color"
                type="color"
                defaultValue={DEFAULT_COLOR}
                className="h-8 w-16 p-1"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-list-description">
                Descripción (opcional)
              </FieldLabel>
              <Textarea
                id="create-list-description"
                name="description"
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
              {isPending ? "Creando..." : "Crear lista"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
