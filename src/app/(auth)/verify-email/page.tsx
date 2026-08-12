import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { VerifyEmailContent } from "./verify-email-content";

// `useSearchParams` (used inside `VerifyEmailContent` to read the `token`
// query parameter) requires a Suspense boundary in the App Router, so this
// page stays a thin Server Component wrapper around the client component.
function VerifyEmailFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Verificación de cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
