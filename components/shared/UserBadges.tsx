import { Badge } from "@/components/ui/badge"
import type { Role, UserStatus } from "@/types"

const ROLE: Record<Role, string> = {
  CUSTOMER: "Customer",
  PROVIDER: "Provider",
  ADMIN: "Admin",
}

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant={role === "ADMIN" ? "default" : "outline"}>
      {ROLE[role]}
    </Badge>
  )
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  if (status === "SUSPENDED")
    return <Badge variant="destructive">Suspended</Badge>
  return (
    <Badge variant="outline" className="border-success/40 text-success">
      Active
    </Badge>
  )
}
