"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { toAdminQuery, type AdminUsersFilters } from "@/lib/adminQuery"
import { queryFetch } from "@/lib/queries/fetcher"
import type { Paginated, User } from "@/types"

export const adminUsersKeys = {
  all: ["admin-users"] as const,
  list: (filters: AdminUsersFilters) =>
    [...adminUsersKeys.all, filters] as const,
}

export function useAdminUsers(
  filters: AdminUsersFilters,
  initialData?: Paginated<User>
) {
  return useQuery({
    queryKey: adminUsersKeys.list(filters),
    queryFn: () =>
      queryFetch<Paginated<User>>(
        `/api/admin/users?${toAdminQuery({ ...filters })}`
      ),
    initialData,
    placeholderData: keepPreviousData,
  })
}
