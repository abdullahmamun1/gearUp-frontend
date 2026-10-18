import { useTranslations } from "@/i18n/translations"

import { Badge } from "@/components/ui/badge"
import type { RentalStatus } from "@/types"

const VARIANT: Record<
  RentalStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  PLACED: "warning",
  CONFIRMED: "ember",
  PAID: "success",
  PICKED_UP: "info",
  RETURNED: "secondary",
  CANCELLED: "destructive",
}

export function RentalStatusBadge({ status }: { status: RentalStatus }) {
  const t = useTranslations("common.rentalStatus")
  return <Badge variant={VARIANT[status]}>{t(status)}</Badge>
}
