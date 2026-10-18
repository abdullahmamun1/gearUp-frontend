import { useTranslations } from "@/i18n/translations"

import { Badge } from "@/components/ui/badge"
import type { PaymentStatus } from "@/types"

const VARIANT: Record<
  PaymentStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "destructive",
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const t = useTranslations("common.paymentStatus")
  return <Badge variant={VARIANT[status]}>{t(status)}</Badge>
}
