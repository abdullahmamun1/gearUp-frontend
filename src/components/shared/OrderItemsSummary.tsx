import type { OrderItem } from "@/types"

export function OrderItemsSummary({ items }: { items: OrderItem[] }) {
  const extra = items.length - 1

  return (
    <>
      {items[0]?.gearItem?.name ?? "—"}
      {extra > 0 && (
        <span className="text-muted-foreground"> +{extra} more</span>
      )}
    </>
  )
}
