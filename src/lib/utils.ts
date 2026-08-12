import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Reads a value out of a FormData object, turning an empty/blank string into
// `undefined`. This is what lets an optional Zod field (e.g. `description`)
// stay untouched instead of being overwritten with "" when a user leaves an
// optional textarea empty.
export function optionalFormValue(
  value: FormDataEntryValue | null,
): string | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined
  }
  return value
}
