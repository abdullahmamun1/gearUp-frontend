"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { CircleAlert, Loader2 } from "lucide-react"

import { verifyEmail } from "@/api/auth"
import { CenteredCard } from "@/components/shared/CenteredCard"
import { MailScene } from "@/components/shared/illustrations/scenes"
import { ResendVerificationButton } from "@/components/shared/ResendVerificationButton"
import { buttonVariants } from "@/components/ui/button"
import { useRunOnce } from "@/hooks/useRunOnce"
import { useSessionUser } from "@/hooks/useSessionUser"
import { cn } from "@/lib/utils"
import { DASHBOARD_HOME } from "@/routes"

/** Verifies the emailed token once, in the browser, so the page is static. */
export function VerifyEmailView() {
  const token = useSearchParams().get("token")
  const { user } = useSessionUser()
  const verify = useCallback(() => verifyEmail(token!), [token])
  const state = useRunOnce(token ? verify : null)
  const next = user ? DASHBOARD_HOME[user.role] : "/login?reason=verified"

  if (state.status === "running") return <VerifyingCard />

  if (state.status === "done" && state.result.success) {
    return (
      <CenteredCard
        illustration={<MailScene />}
        tone="success"
        title="Your email is verified"
        description="Thanks! You can now pay for rentals and publish listings."
      >
        <Link
          href={next}
          className={cn(buttonVariants({ size: "lg" }), "h-10 w-full text-sm")}
        >
          {user ? "Go to your dashboard" : "Log in"}
        </Link>
      </CenteredCard>
    )
  }

  return (
    <CenteredCard
      icon={CircleAlert}
      tone="error"
      title="We couldn't verify this link"
      description={
        state.status === "done"
          ? state.result.message
          : "The link is incomplete. Open it from your email again."
      }
    >
      <div className="grid gap-3 text-sm text-muted-foreground">
        <p>
          Already clicked it once? Then you&apos;re probably verified already —
          links only work one time.
        </p>
        {user ? (
          <div className="flex items-center gap-3">
            <ResendVerificationButton />
            <Link href={next} className="text-primary hover:underline">
              Go to your dashboard
            </Link>
          </div>
        ) : (
          <p>
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>{" "}
            to send yourself a new link.
          </p>
        )}
      </div>
    </CenteredCard>
  )
}

export function VerifyingCard() {
  return (
    <CenteredCard
      icon={Loader2}
      busy
      title="Checking your link…"
      description="This only takes a moment."
    />
  )
}
