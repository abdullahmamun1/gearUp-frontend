"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { cancelRental } from "@/app/(dashboard)/_actions/cancelRental"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { myRentalsKeys } from "@/lib/queries/customer"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CancelOrderButton({
  orderId,
  refundAmount = 0,
}: {
  orderId: string
  /** Set for paid orders: what goes back to the card. */
  refundAmount?: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  function confirm() {
    startTransition(async () => {
      const res = await cancelRental(orderId)

      if (!res.success) {
        toast.error(res.message || "Couldn't cancel this order.")
        return
      }

      queryClient.invalidateQueries({ queryKey: myRentalsKeys.all })
      setOpen(false)
      toast.success(
        refundAmount > 0
          ? `Order cancelled. ${formatPrice(refundAmount)} is on its way back to your card.`
          : "Order cancelled."
      )
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            className="h-9 text-sm hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          >
            Cancel order
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this order?</DialogTitle>
          <DialogDescription>
            {refundAmount > 0
              ? `You'll get a full refund of ${formatPrice(refundAmount)} to your card. Refunds usually arrive within 5–10 business days.`
              : "Your dates are released for other renters."}{" "}
            This can&apos;t be undone — you&apos;d need to place a new order to
            rent it again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" size="lg" className="h-9 text-sm">
                Keep it
              </Button>
            }
          />
          <Button
            variant="destructive"
            size="lg"
            onClick={confirm}
            disabled={isPending}
            className="h-9 text-sm"
          >
            {isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            )}
            {isPending ? "Cancelling…" : "Cancel order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
