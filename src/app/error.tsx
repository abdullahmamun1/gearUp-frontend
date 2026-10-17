"use client"

import { ErrorState } from "@/components/shared/ErrorState"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorState error={error} reset={reset} className="min-h-svh" />
}
