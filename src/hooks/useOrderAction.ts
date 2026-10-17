"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { updateOrderStatus, type OrderStatusUpdate } from "@/api/rentals"
import { providerOrdersKeys } from "@/hooks/queries/providerOrders"

/** Runs a provider order transition and refreshes the orders table. */
export function useOrderAction(orderId: string) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  function run(
    update: OrderStatusUpdate,
    success: string,
    onDone?: () => void
  ) {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, update)

      // A 409 (expired request) also changed the order, so refresh either way.
      queryClient.invalidateQueries({ queryKey: providerOrdersKeys.all })
      router.refresh()

      if (!res.success) {
        toast.error(res.message || "Couldn't update this order.")
        return
      }

      toast.success(success)
      onDone?.()
    })
  }

  return { run, isPending }
}
