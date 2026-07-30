"use client"

import { ErrorState } from "@/components/shared/ErrorState"

export default function DashboardError({
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
      description="We couldn't load this part of your dashboard. Trying again usually sorts it out."
      homeLabel="Back to site"
      className="py-16"
    />
  )
}
