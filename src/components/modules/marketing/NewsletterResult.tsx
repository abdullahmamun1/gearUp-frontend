"use client"

import { Link } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { CircleAlert, Loader2, MailX } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { confirmNewsletter, unsubscribeNewsletter } from "@/api/newsletter"
import { CenteredCard } from "@/components/shared/CenteredCard"
import { MailScene } from "@/components/shared/illustrations/scenes"
import { buttonVariants } from "@/components/ui/button"
import { useRunOnce } from "@/hooks/useRunOnce"
import { cn } from "@/lib/utils"

/** Confirms or cancels a subscription from the emailed link, in the browser. */
export function NewsletterResult({
  mode,
}: {
  mode: "confirm" | "unsubscribe"
}) {
  const t = useTranslations("pages.newsletter")
  const token = useSearchParams().get("token")
  const action = useCallback(
    () =>
      mode === "confirm"
        ? confirmNewsletter(token!)
        : unsubscribeNewsletter(token!),
    [mode, token]
  )
  const state = useRunOnce(token ? action : null)

  if (state.status === "running") {
    return <CenteredCard icon={Loader2} busy title={t("oneMoment")} />
  }

  if (state.status !== "done" || !state.result.success) {
    return (
      <CenteredCard
        icon={CircleAlert}
        tone="error"
        title={mode === "confirm" ? t("confirmFailed") : t("unsubscribeFailed")}
        description={t("failedDescription")}
      />
    )
  }

  const email = state.result.data?.email
  return mode === "confirm" ? (
    <CenteredCard
      illustration={<MailScene />}
      tone="success"
      title={t("subscribedTitle")}
      description={t("subscribedDescription", { email: email ?? "" })}
    >
      <Link
        href="/gear"
        className={cn(buttonVariants({ size: "lg" }), "h-10 w-full text-sm")}
      >
        {t("browseGear")}
      </Link>
    </CenteredCard>
  ) : (
    <CenteredCard
      icon={MailX}
      title={t("unsubscribedTitle")}
      description={t("unsubscribedDescription", { email: email ?? "" })}
    />
  )
}
