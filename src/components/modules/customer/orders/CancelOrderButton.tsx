"use client"

import { useRouter } from "@/i18n/navigation"
import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { cancelRental } from "@/api/rentals"
import { Button } from "@/components/ui/button"
import { useFormat } from "@/i18n/useFormat"
import { myRentalsKeys } from "@/hooks/queries/customer"
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
  const t = useTranslations("dashboard.customer.cancel")
  const format = useFormat()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  function confirm() {
    startTransition(async () => {
      const res = await cancelRental(orderId)

      if (!res.success) {
        toast.error(res.message || t("failed"))
        return
      }

      queryClient.invalidateQueries({ queryKey: myRentalsKeys.all })
      setOpen(false)
      toast.success(
        refundAmount > 0
          ? t("cancelledRefund", { amount: format.price(refundAmount) })
          : t("cancelled")
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
            {t("trigger")}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {refundAmount > 0
              ? t("refundBody", {
                  amount: format.price(refundAmount),
                  min: format.number(5),
                  max: format.number(10),
                })
              : t("releasedBody")}{" "}
            {t("undone")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" size="lg" className="h-9 text-sm">
                {t("keep")}
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
            {isPending ? t("cancelling") : t("trigger")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
