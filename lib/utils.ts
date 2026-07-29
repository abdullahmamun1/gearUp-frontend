import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeRedirect(path: string | undefined, fallback = "/") {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback
  return path
}
