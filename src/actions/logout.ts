"use server";

import { signOut } from "@/auth";
import type { ActionResult } from "@/lib/types";

export async function logout(): Promise<ActionResult> {
  // `redirect: false`: the calling client component navigates afterwards
  // (e.g. to "/login"), same as the login action.
  await signOut({ redirect: false });
  return { success: true };
}
