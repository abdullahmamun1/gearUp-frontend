import { useTranslations } from "@/i18n/translations"

import type { OrderItem } from "@/types"

export function OrderItemsSummary({ items }: { items: OrderItem[] }) {
  const t = useTranslations("common.orderItems")
  const extra = items.length - 1

  return (
    <>
      {items[0]?.gearItem?.name ?? "—"}
      {extra > 0 && (
        <span className="text-muted-foreground">
          {" "}
          {t("more", { count: extra })}
        </span>
      )}
    </>
  )
}
