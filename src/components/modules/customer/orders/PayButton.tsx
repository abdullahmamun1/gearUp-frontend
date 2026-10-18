"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { CreditCard, Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { createPayment } from "@/api/payments"
import { Button } from "@/components/ui/button"
import { useFormat } from "@/i18n/useFormat"

export function PayButton({
  orderId,
  amount,
  resume,
}: {
  orderId: string
  amount: string
  resume?: boolean
}) {
  const t = useTranslations("dashboard.customer.pay")
  const format = useFormat()
  const [isPending, startTransition] = useTransition()

  function pay() {
    startTransition(async () => {
      const res = await createPayment(orderId)

      if (!res.success || !res.data?.paymentUrl) {
        toast.error(res.message || t("failed"))
        return
      }

      window.location.href = res.data.paymentUrl
    })
  }

  return (
    <Button
      type="button"
      variant="cta"
      size="lg"
      onClick={pay}
      disabled={isPending}
      className="mt-4 h-11 w-full text-sm"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <CreditCard className="size-4" aria-hidden />
      )}
      {isPending
        ? t("opening")
        : resume
          ? t("resume")
          : t("pay", { amount: format.price(amount) })}
    </Button>
  )
}
