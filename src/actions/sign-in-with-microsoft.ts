"use server";

import { signIn } from "@/auth";

// Thin wrapper so the login page (a Client Component, needed for the
// email+password form's useActionState) can still trigger this sign-in as a
// plain <form action={...}> without importing the server-only "@/auth"
// module directly into client code.
export async function signInWithMicrosoft() {
  await signIn("microsoft-entra-id", { redirectTo: "/dashboard" });
}
