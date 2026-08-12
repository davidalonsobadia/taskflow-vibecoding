// Shared return type for every Server Action in this app. Client components
// can render success/error state uniformly by checking `result.success`.
export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

// `import type` only: erased at compile time, so this never pulls the real
// Drizzle table objects (or the DB client they come from) into client
// bundles -- it is only used here to derive the row shape.
import type { lists, tasks } from "@/db/schema";

export type List = typeof lists.$inferSelect;
export type Task = typeof tasks.$inferSelect;
