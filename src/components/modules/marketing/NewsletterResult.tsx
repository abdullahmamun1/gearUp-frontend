"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { CircleAlert, Loader2, MailX } from "lucide-react"

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
    return <CenteredCard icon={Loader2} busy title="One moment…" />
  }

  if (state.status !== "done" || !state.result.success) {
    return (
      <CenteredCard
        icon={CircleAlert}
        tone="error"
        title={
          mode === "confirm"
            ? "We couldn't confirm this link"
            : "We couldn't find that subscription"
        }
        description="The link may be incomplete. Open it from the email again."
      />
    )
  }

  const email = state.result.data?.email
  return mode === "confirm" ? (
    <CenteredCard
      illustration={<MailScene />}
      tone="success"
      title="You're subscribed"
      description={`We'll send news to ${email}. Every email has a one-click unsubscribe link.`}
    >
      <Link
        href="/gear"
        className={cn(buttonVariants({ size: "lg" }), "h-10 w-full text-sm")}
      >
        Browse gear
      </Link>
    </CenteredCard>
  ) : (
    <CenteredCard
      icon={MailX}
      title="You've been unsubscribed"
      description={`${email} won't get GearUp news any more. Emails about your bookings are not affected.`}
    />
  )
}
