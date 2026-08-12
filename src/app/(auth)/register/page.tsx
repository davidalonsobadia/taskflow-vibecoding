"use client";

import { useActionState } from "react";
import Link from "next/link";

import { register } from "@/actions/register";
import type { ActionResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// Wraps the `register` server action so it matches the (previousState,
// formData) signature `useActionState` expects, and adds the confirm-password
// check. `registerSchema` has no `confirmPassword` field, so this check
// happens only here, before the action is even called.
async function registerAction(
  _previousState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    return { success: false, error: "Las contraseñas no coinciden" };
  }

  return register({
    name: formData.get("name"),
    email: formData.get("email"),
    password,
  });
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    null
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            Regístrate gratis para empezar a organizar tus tareas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state?.success ? (
            <div className="space-y-1 text-sm">
              <p className="font-medium">¡Cuenta creada!</p>
              <p className="text-muted-foreground">{state.message}</p>
            </div>
          ) : (
            <form action={formAction}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nombre</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Tu nombre"
                    autoComplete="name"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    autoComplete="email"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirmar contraseña
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    required
                  />
                </Field>
                {state && !state.success ? (
                  <FieldError>{state.error}</FieldError>
                ) : null}
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </FieldGroup>
            </form>
          )}
        </CardContent>
        <CardFooter className="text-sm">
          <p className="text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline underline-offset-4"
            >
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
