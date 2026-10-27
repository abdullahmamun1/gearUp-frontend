"use client"

import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

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
  const t = useTranslations("dashboard.customer.redirect")
  return (
    <CenteredCard
      icon={Loader2}
      busy
      fullScreen
      title={t("title")}
      description={t("description")}
    />
  )
}
