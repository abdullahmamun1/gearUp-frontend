import { Badge } from "@/components/ui/badge"
import type { PaymentStatus } from "@/types"

const STATUS: Record<
  PaymentStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  PENDING: { label: "Awaiting payment", variant: "outline" },
  COMPLETED: { label: "Paid", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" },
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, variant } = STATUS[status]
  return <Badge variant={variant}>{label}</Badge>
}
