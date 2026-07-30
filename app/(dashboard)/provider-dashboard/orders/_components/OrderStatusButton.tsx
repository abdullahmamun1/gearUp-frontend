"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { updateOrderStatus } from "@/app/(dashboard)/_actions/updateOrderStatus"
import { Button } from "@/components/ui/button"
import type { RentalStatus } from "@/types"

export function OrderStatusButton({
  orderId,
  next,
  label,
}: {
  orderId: string
  next: RentalStatus
  label: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function advance() {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, next)

      if (!res.success) {
        toast.error(res.message || "Couldn't update this order.")
        return
      }

      toast.success(`Order marked ${next.toLowerCase().replace("_", " ")}.`)
      router.refresh()
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={advance}
      disabled={isPending}
      className="relative z-10 h-8 text-xs"
    >
      {isPending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      {isPending ? "Saving…" : label}
    </Button>
  )
}
