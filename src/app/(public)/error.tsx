"use client"

import { ErrorState } from "@/components/shared/ErrorState"

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      description="We couldn't load this page. Trying again usually sorts it out."
      homeHref="/gear"
      homeLabel="Browse gear"
    />
  )
}
