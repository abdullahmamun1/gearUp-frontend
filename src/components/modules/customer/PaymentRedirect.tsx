"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

import { CenteredCard } from "@/components/shared/CenteredCard"

/**
 * Stripe sends customers to /payment-success or /payment-cancelled with
 * ?orderId. These static pages forward them to that order.
 */
export function PaymentRedirect({ flag }: { flag: "paid" | "cancelled" }) {
  const router = useRouter()
  const orderId = useSearchParams().get("orderId")

  useEffect(() => {
    router.replace(
      orderId
        ? `/dashboard/customer/orders/${encodeURIComponent(orderId)}?${flag}=1`
        : "/dashboard/customer/orders"
    )
  }, [flag, orderId, router])

  return <PaymentRedirectCard />
}

export function PaymentRedirectCard() {
  return (
    <CenteredCard
      icon={Loader2}
      busy
      title="Taking you to your order…"
      description="Hang on a second."
    />
  )
}
