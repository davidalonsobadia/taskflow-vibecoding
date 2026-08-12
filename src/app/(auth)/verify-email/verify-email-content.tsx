"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { verifyEmail } from "@/actions/verify-email";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Status = "verifying" | "success" | "error";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  // Guards against calling the action twice (React runs effects twice in
  // development under Strict Mode).
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) {
      return;
    }
    hasRun.current = true;

    if (!token) {
      setStatus("error");
      setErrorMessage("Falta el token de verificación en el enlace.");
      return;
    }

    verifyEmail({ token }).then((result) => {
      if (result.success) {
        setStatus("success");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setStatus("error");
        setErrorMessage(result.error);
      }
    });
  }, [token, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Verificación de cuenta</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {status === "verifying" ? (
            <p className="text-muted-foreground">
              Verificando tu cuenta, espera un momento...
            </p>
          ) : null}
          {status === "success" ? (
            <div className="space-y-1">
              <p className="font-medium">¡Cuenta verificada correctamente!</p>
              <p className="text-muted-foreground">
                Te llevamos a la página de inicio de sesión...
              </p>
            </div>
          ) : null}
          {status === "error" ? (
            <div className="space-y-1">
              <p className="font-medium text-destructive">
                No hemos podido verificar tu cuenta
              </p>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>
          ) : null}
        </CardContent>
        {status === "error" ? (
          <CardFooter>
            <Link
              href="/login"
              className="text-sm text-primary underline underline-offset-4"
            >
              Volver a iniciar sesión
            </Link>
          </CardFooter>
        ) : null}
      </Card>
    </main>
  );
}
