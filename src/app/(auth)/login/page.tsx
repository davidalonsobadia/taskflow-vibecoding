"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { login } from "@/actions/login";
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

// Wraps the `login` server action so it matches the (previousState, formData)
// signature that `useActionState` expects.
async function loginAction(
  _previousState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return login({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  // `login` uses `redirect: false`, so we redirect ourselves once the
  // action reports success.
  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard");
    }
  }, [state, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Introduce tu email y tu contraseña para acceder a tus listas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
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
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  required
                />
              </Field>
              {state && !state.success ? (
                <FieldError>{state.error}</FieldError>
              ) : null}
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Entrando..." : "Iniciar sesión"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 text-sm">
          <p className="text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline underline-offset-4"
            >
              Regístrate
            </Link>
          </p>
          <Link
            href="/forgot-password"
            className="text-muted-foreground underline underline-offset-4"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
