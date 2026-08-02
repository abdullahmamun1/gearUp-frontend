"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { updateUserStatus } from "@/app/(dashboard)/_actions/updateUserStatus"
import { useSession } from "@/components/providers/SessionProvider"
import { UserStatusBadge } from "@/components/shared/UserBadges"
import { Switch } from "@/components/ui/switch"
import type { AdminUsersFilters } from "@/lib/adminQuery"
import { adminUsersKeys } from "@/lib/queries/adminUsers"
import { cn } from "@/lib/utils"
import type { Paginated, User, UserStatus } from "@/types"

export function UserStatusToggle({
  user,
  filters,
}: {
  user: User
  filters: AdminUsersFilters
}) {
  const session = useSession()
  const isSelf = user.id === session?.id
  const queryClient = useQueryClient()
  const queryKey = adminUsersKeys.list(filters)

  const { mutate, isPending } = useMutation({
    mutationFn: async (status: UserStatus) => {
      const res = await updateUserStatus(user.id, status)
      if (!res.success) throw new Error(res.message)
      return res.data
    },

    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Paginated<User>>(queryKey)

      queryClient.setQueryData<Paginated<User>>(queryKey, (current) =>
        current
          ? {
              ...current,
              data: current.data.map((row) =>
                row.id === user.id ? { ...row, status } : row
              ),
            }
          : current
      )

      return { previous }
    },

    onError: (error, _status, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
      toast.error(error.message || "Couldn't change this account's status.")
    },

    onSuccess: (_data, status) => {
      toast.success(
        status === "ACTIVE"
          ? `${user.name} can sign in again.`
          : `${user.name} is suspended and can no longer sign in.`
      )
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  const active = user.status === "ACTIVE"

  if (isSelf) {
    return (
      <div className="flex items-center gap-2">
        <UserStatusBadge status={user.status} />
        <span className="text-xs text-muted-foreground">your account</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={active}
        onCheckedChange={(next) => mutate(next ? "ACTIVE" : "SUSPENDED")}
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
