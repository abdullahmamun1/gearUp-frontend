"use client"

import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"

import { updateUserStatus } from "@/app/(dashboard)/_actions/updateUserStatus"
import { UserStatusBadge } from "@/components/shared/UserBadges"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { User } from "@/types"

export function UserStatusToggle({
  user,
  isSelf,
}: {
  user: User
  isSelf: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useOptimistic(user.status)

  const active = status === "ACTIVE"

  if (isSelf) {
    return (
      <div className="flex items-center gap-2">
        <UserStatusBadge status={status} />
        <span className="text-xs text-muted-foreground">your account</span>
      </div>
    )
  }

  function toggle(next: boolean) {
    startTransition(async () => {
      setStatus(next ? "ACTIVE" : "SUSPENDED")
      const res = await updateUserStatus(user.id, next ? "ACTIVE" : "SUSPENDED")

      if (!res.success) {
        toast.error(res.message || "Couldn't change this account's status.")
        return
      }

      toast.success(
        next
          ? `${user.name} can sign in again.`
          : `${user.name} is suspended and can no longer sign in.`
      )
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={active}
        onCheckedChange={toggle}
        disabled={isPending}
        tone="status"
        aria-label={active ? `Suspend ${user.name}` : `Reactivate ${user.name}`}
      />
      <span
        className={cn(
          "text-xs whitespace-nowrap",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {active ? "Active" : "Suspended"}
      </span>
    </div>
  )
}
