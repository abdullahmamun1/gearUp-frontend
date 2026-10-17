"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { RentalStatus } from "@/types"

import { useOrderAction } from "./useOrderAction"

export function OrderStatusButton({
  orderId,
  next,
  label,
}: {
  orderId: string
  next: RentalStatus
  label: string
}) {
  const { run, isPending } = useOrderAction(orderId)

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={() =>
        run(
          { status: next },
          `Order marked ${next.toLowerCase().replace("_", " ")}.`
        )
      }
      disabled={isPending}
      className="h-8 text-xs hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
    >
      {isPending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      {isPending ? "Saving…" : label}
    </Button>
  )
}
