"use client"

import { useErrorMessage } from "@/hooks/useErrorMessage"
import { cn } from "@/lib/utils"

/** A field's error line; translates message keys ("auth.validation.…"). */
export function FieldError({
  id,
  message,
  className,
}: {
  id?: string
  message?: string | null
  className?: string
}) {
  const translate = useErrorMessage()
  if (!message) return null
  return (
    <p id={id} className={cn("text-xs text-destructive", className)}>
      {translate(message)}
    </p>
  )
}
