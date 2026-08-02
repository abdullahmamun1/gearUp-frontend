"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { cancelRental } from "@/app/(dashboard)/_actions/cancelRental"
import { Button } from "@/components/ui/button"
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

export function CancelOrderButton({ orderId }: { orderId: string }) {
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
      toast.success("Order cancelled. The units are back in stock.")
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
            The gear goes back into stock and this can&apos;t be undone.
            You&apos;d need to place a new order to rent it again.
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
