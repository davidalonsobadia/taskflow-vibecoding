"use client";

import { useActionState } from "react";
import Link from "next/link";

import { forgotPassword } from "@/actions/forgot-password";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// Same generic message no matter what the action actually returns, so this
// page never reveals whether an email has an account.
const GENERIC_MESSAGE =
  "Si el email existe en nuestro sistema, te hemos enviado un enlace para restablecer tu contraseña.";

async function forgotPasswordAction(
  _previousState: boolean,
  formData: FormData
): Promise<boolean> {
  await forgotPassword({ email: formData.get("email") });
  // Always "submitted", regardless of the action's result.
  return true;
}

export default function ForgotPasswordPage() {
  const [submitted, formAction, isPending] = useActionState(
    forgotPasswordAction,
    false
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Recuperar contraseña</CardTitle>
          <CardDescription>
            Escribe tu email y te enviaremos un enlace para restablecer tu
            contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="text-sm text-muted-foreground">
              {GENERIC_MESSAGE}
            </p>
          ) : (
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
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? "Enviando..." : "Enviar enlace"}
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
