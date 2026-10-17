import { Badge } from "@/components/ui/badge"
import type { RentalStatus } from "@/types"

const STATUS: Record<
  RentalStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  PLACED: { label: "Awaiting confirmation", variant: "outline" },
  CONFIRMED: { label: "Confirmed", variant: "secondary" },
  PAID: { label: "Paid", variant: "default" },
  PICKED_UP: { label: "Picked up", variant: "default" },
  RETURNED: { label: "Returned", variant: "secondary" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
}

export function RentalStatusBadge({ status }: { status: RentalStatus }) {
  const { label, variant } = STATUS[status]
  return <Badge variant={variant}>{label}</Badge>
}
