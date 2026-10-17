import type { Metadata } from "next"
import Link from "next/link"
import { CircleAlert, MailCheck } from "lucide-react"

import { CenteredCard } from "@/components/shared/CenteredCard"
import { ResendVerificationButton } from "@/components/shared/ResendVerificationButton"
import { buttonVariants } from "@/components/ui/button"
import { DASHBOARD_HOME } from "@/lib/routes"
import { first } from "@/lib/searchParams"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import { verifyEmail } from "@/service/auth"

export const metadata: Metadata = {
  title: "Verify email · GearUp",
  robots: { index: false },
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const token = first((await searchParams).token)
  const session = await getSession()
  const res = token ? await verifyEmail(token) : null
  const next = session ? DASHBOARD_HOME[session.role] : "/login?reason=verified"

  if (res?.success) {
    return (
      <CenteredCard
        icon={MailCheck}
        tone="success"
        title="Your email is verified"
        description="Thanks! You can now pay for rentals and publish listings."
      >
        <Link
          href={next}
          className={cn(buttonVariants({ size: "lg" }), "h-10 w-full text-sm")}
        >
          {session ? "Go to your dashboard" : "Log in"}
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
        res?.message ?? "The link is incomplete. Open it from your email again."
      }
    >
      <div className="grid gap-3 text-sm text-muted-foreground">
        <p>
          Already clicked it once? Then you&apos;re probably verified already —
          links only work one time.
        </p>
        {session ? (
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
