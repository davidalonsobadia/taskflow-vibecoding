import { z } from "zod";

// A "#" followed by exactly 6 hex digits, e.g. "#dc2626".
const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
// Plain "YYYY-MM-DD" date string (matches the `date` column's "string" mode).
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token inválido"),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Introduce un email válido"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token inválido"),
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

export const createListSchema = z.object({
  name: z.string().min(1, "El nombre de la lista es obligatorio"),
  color: z
    .string()
    .regex(hexColorRegex, "El color debe ser un código hexadecimal, p. ej. #dc2626")
    .optional(),
  description: z.string().optional(),
});
export type CreateListInput = z.infer<typeof createListSchema>;

// Same fields as createListSchema, but every field is optional so callers can
// send only what changed.
export const updateListSchema = createListSchema.partial();
export type UpdateListInput = z.infer<typeof updateListSchema>;

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export const taskPriorityEnum = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "El título de la tarea es obligatorio"),
  description: z.string().optional(),
  listId: z.number().int().positive("listId debe ser un entero positivo"),
  priority: taskPriorityEnum.default("medium"),
  dueDate: z
    .string()
    .regex(isoDateRegex, "La fecha debe tener el formato AAAA-MM-DD")
    .optional(),
  completed: z.boolean().optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// A task never changes list in this app, so there is no `listId` here.
export const updateTaskSchema = createTaskSchema
  .omit({ listId: true })
  .partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
