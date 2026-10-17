import type { Metadata } from "next"
import Link from "next/link"
import { CircleAlert, PartyPopper } from "lucide-react"

import { confirmNewsletter } from "@/api/newsletter"
import { CenteredCard } from "@/components/shared/CenteredCard"
import { buttonVariants } from "@/components/ui/button"
import { first } from "@/utils/searchParams"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Newsletter · GearUp",
  robots: { index: false },
}

export default async function ConfirmNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const token = first((await searchParams).token)
  const res = token ? await confirmNewsletter(token) : null

  if (!res?.success) {
    return (
      <CenteredCard
        icon={CircleAlert}
        tone="error"
        title="We couldn't confirm this link"
        description="It may be incomplete. Try signing up again from the home page."
      />
    )
  }

  return (
    <CenteredCard
      icon={PartyPopper}
      tone="success"
      title="You're subscribed"
      description={`We'll send news to ${res.data?.email}. Every email has a one-click unsubscribe link.`}
    >
      <Link
        href="/gear"
        className={cn(buttonVariants({ size: "lg" }), "h-10 w-full text-sm")}
      >
        Browse gear
      </Link>
    </CenteredCard>
  )
}
