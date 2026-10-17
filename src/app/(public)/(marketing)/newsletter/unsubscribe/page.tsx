import type { Metadata } from "next"
import { CircleAlert, MailX } from "lucide-react"

import { unsubscribeNewsletter } from "@/api/newsletter"
import { CenteredCard } from "@/components/shared/CenteredCard"
import { first } from "@/utils/searchParams"

export const metadata: Metadata = {
  title: "Unsubscribe · GearUp",
  robots: { index: false },
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const token = first((await searchParams).token)
  const res = token ? await unsubscribeNewsletter(token) : null

  if (!res?.success) {
    return (
      <CenteredCard
        icon={CircleAlert}
        tone="error"
        title="We couldn't find that subscription"
        description="The link may be incomplete. Open it from the email again."
      />
    )
  }

  return (
    <CenteredCard
      icon={MailX}
      title="You've been unsubscribed"
      description={`${res.data?.email} won't get GearUp news any more. Emails about your bookings are not affected.`}
    />
  )
}
