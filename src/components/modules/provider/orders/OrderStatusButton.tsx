"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { Button } from "@/components/ui/button"

import { useOrderAction } from "@/hooks/useOrderAction"

export function OrderStatusButton({
  orderId,
  next,
  label,
}: {
  orderId: string
  next: "CONFIRMED" | "PICKED_UP" | "RETURNED"
  label: string
}) {
  const { run, isPending } = useOrderAction(orderId)
  const t = useTranslations("provider.orders")

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={() => run({ status: next }, t(`marked.${next}`))}
      disabled={isPending}
      className="h-8 text-xs hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
    >
      {isPending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      {isPending ? t("saving") : label}
    </Button>
  )
}
