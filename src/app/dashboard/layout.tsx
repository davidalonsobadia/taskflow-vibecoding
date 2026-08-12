import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { logout } from "@/actions/logout";

// Small inline Server Action (note the "use server" directive on the
// function itself, not on the file): `logout()` only clears the session, it
// never redirects on its own, so this wrapper does the redirect afterwards.
async function logoutAndRedirect() {
  "use server";

  await logout();
  redirect("/");
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // `src/middleware.ts` already blocks unauthenticated requests to
  // `/dashboard/*`, but the page itself still needs `auth()` to read the
  // current user for display and for the DB queries below it.
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <span className="font-heading text-lg font-semibold">TaskFlow</span>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {session.user.name} ({session.user.email})
          </span>
          <form action={logoutAndRedirect}>
            <Button type="submit" variant="outline" size="sm">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
