"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { resetPassword } from "@/actions/reset-password";
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

export function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  // Wraps the `resetPassword` server action: checks the token is present and
  // the two password fields match/are long enough before ever calling it.
  async function resetPasswordAction(
    _previousState: ActionResult | null,
    formData: FormData
  ): Promise<ActionResult> {
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword.length < 8) {
      return {
        success: false,
        error: "La contraseña debe tener al menos 8 caracteres",
      };
    }
    if (newPassword !== confirmPassword) {
      return { success: false, error: "Las contraseñas no coinciden" };
    }
    if (!token) {
      return {
        success: false,
        error: "Falta el token de recuperación en el enlace",
      };
    }

    return resetPassword({ token, newPassword });
  }

  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      const timeout = setTimeout(() => {
        router.push("/login");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [state, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Restablecer contraseña</CardTitle>
          <CardDescription>Escribe tu nueva contraseña.</CardDescription>
        </CardHeader>
        <CardContent>
          {state?.success ? (
            <div className="space-y-1 text-sm">
              <p className="font-medium">{state.message}</p>
              <p className="text-muted-foreground">
                Te llevamos a la página de inicio de sesión...
              </p>
            </div>
          ) : (
            <form action={formAction}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="newPassword">
                    Nueva contraseña
                  </FieldLabel>
                  <Input
                    id="newPassword"
                    name="newPassword"
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
                  {isPending ? "Guardando..." : "Restablecer contraseña"}
                </Button>
              </FieldGroup>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Link
            href="/login"
            className="text-sm text-primary underline underline-offset-4"
          >
            Volver a iniciar sesión
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
