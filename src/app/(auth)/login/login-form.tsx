"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { login } from "@/actions/login";
import { signInWithMicrosoft } from "@/actions/sign-in-with-microsoft";
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
import { Separator } from "@/components/ui/separator";

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

// The classic 4-square Microsoft logo, inlined as SVG so this button doesn't
// need an extra icon package.
function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 21 21" className="size-4" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

export function LoginForm({
  microsoftEnabled,
  forgotPasswordEnabled,
}: {
  microsoftEnabled: boolean;
  forgotPasswordEnabled: boolean;
}) {
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
          {microsoftEnabled ? (
            <div className="mb-4 flex flex-col gap-4">
              <form action={signInWithMicrosoft}>
                <Button type="submit" variant="outline" className="w-full gap-2">
                  <MicrosoftLogo />
                  Iniciar sesión con Microsoft
                </Button>
              </form>
              <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">o con tu email</span>
                <Separator className="flex-1" />
              </div>
            </div>
          ) : null}
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
          {forgotPasswordEnabled ? (
            <Link
              href="/forgot-password"
              className="text-muted-foreground underline underline-offset-4"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          ) : null}
        </CardFooter>
      </Card>
    </main>
  );
}
