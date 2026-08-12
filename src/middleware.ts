import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "./auth.config";

// A second, edge-safe NextAuth instance built ONLY from `authConfig`. We do
// NOT import from "./auth" here -- that file pulls in bcryptjs and the
// database client, which are Node-only and must never end up in the Edge
// Runtime bundle that middleware runs in.
const { auth } = NextAuth(authConfig);

// Explicit middleware: read the session on the request, then decide.
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
