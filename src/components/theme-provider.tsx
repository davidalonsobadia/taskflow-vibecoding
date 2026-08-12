"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

// Thin wrapper so the rest of the app imports from "@/components/theme-provider"
// instead of "next-themes" directly -- matches the shadcn/next-themes convention.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
