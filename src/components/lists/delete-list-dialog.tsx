"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteList } from "@/actions/delete-list";
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
import { FieldError } from "@/components/ui/field";
import type { ActionResult, List } from "@/lib/types";

export function DeleteListDialog({ list }: { list: List }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function action(): Promise<ActionResult> {
    const result = await deleteList({ id: list.id });

    if (result.success) {
      toast.success(result.message ?? "Lista eliminada correctamente");
      setOpen(false);
      router.refresh();
    }

    return result;
  }

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Eliminar lista">
          <Trash2Icon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar lista</DialogTitle>
          <DialogDescription>
            ¿Seguro que quieres eliminar la lista &ldquo;{list.name}&rdquo;?
            Se eliminarán también todas sus tareas. Esta acción no se puede
            deshacer.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          {state && !state.success && <FieldError>{state.error}</FieldError>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Eliminando..." : "Eliminar lista"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
