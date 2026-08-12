import { handlers } from "@/auth";

// This is the ONLY Route Handler in the whole app. Every other read/write
// goes through Server Components and Server Actions -- this one exists only
// because Auth.js needs an HTTP endpoint of its own (sign-in, callback,
// session, etc.).
export const { GET, POST } = handlers;
