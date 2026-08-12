import Link from "next/link";

import { Button } from "@/components/ui/button";

// Landing page: a plain Server Component, no data fetching. Just a short
// pitch and two buttons pointing to the auth pages.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-background p-8 text-center">
      <div className="max-w-xl space-y-4">
        <h1 className="font-heading text-4xl font-semibold">TaskFlow</h1>
        <p className="text-lg text-muted-foreground">
          TaskFlow es la forma más simple de organizar tus tareas en listas.
          Crea tus listas, añade tareas con su prioridad y fecha límite, y
          lleva el control de lo que ya has completado.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/register">Crear cuenta gratis</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </div>
    </main>
  );
}
