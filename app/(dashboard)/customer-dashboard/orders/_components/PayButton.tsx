"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { CreditCard, Loader2 } from "lucide-react"

import { createPayment } from "@/app/(dashboard)/_actions/createPayment"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"

export function PayButton({
  orderId,
  amount,
  resume,
}: {
  orderId: string
  amount: string
  /** A PENDING payment already exists, so this reopens that session. */
  resume?: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function pay() {
    startTransition(async () => {
      const res = await createPayment(orderId)

      if (!res.success || !res.data?.paymentUrl) {
        toast.error(res.message || "Couldn't start checkout. Please try again.")
        return
      }

      // Stripe is an external host, so this has to be a full navigation —
      // router.push would try to resolve it as an app route.
      window.location.href = res.data.paymentUrl
    })
  }

  return (
    <Button
      type="button"
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
        ? "Opening checkout…"
        : resume
          ? "Resume payment"
          : `Pay ${formatPrice(amount)}`}
    </Button>
  )
}
