import { useTranslations } from "@/i18n/translations"

import { Badge } from "@/components/ui/badge"
import type { Role, UserStatus } from "@/types"

export function RoleBadge({ role }: { role: Role }) {
  const t = useTranslations("common.role")
  return (
    <Badge variant={role === "ADMIN" ? "default" : "outline"}>{t(role)}</Badge>
  )
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const t = useTranslations("common.userStatus")
  if (status === "SUSPENDED")
    return <Badge variant="destructive">{t("SUSPENDED")}</Badge>
  return <Badge variant="success">{t("ACTIVE")}</Badge>
}
