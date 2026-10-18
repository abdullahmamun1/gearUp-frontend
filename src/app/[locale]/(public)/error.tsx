"use client"

import { useTranslations } from "@/i18n/translations"

import { ErrorState } from "@/components/shared/ErrorState"

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("nav.errors")

  return (
    <ErrorState
      error={error}
      reset={reset}
      description={t("publicDescription")}
      homeHref="/gear"
      homeLabel={t("browseGear")}
    />
  )
}
