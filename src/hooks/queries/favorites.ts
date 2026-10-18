"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { saveGear, unsaveGear } from "@/api/favorites"
import { useSessionUser } from "@/hooks/useSessionUser"
import { queryFetch } from "./fetcher"
import type { Favorites } from "@/types"

export const favoriteKeys = { all: ["favorites"] as const }

/**
 * The signed-in customer's saved gear. Per user and never baked into the
 * cached public pages: hearts on a static page fill in after this loads.
 * Disabled (empty) for anyone who isn't a customer.
 */
export function useFavorites() {
  const { user } = useSessionUser()
  const enabled = user?.role === "CUSTOMER"
  const query = useQuery({
    queryKey: favoriteKeys.all,
    queryFn: () => queryFetch<Favorites>("/api/favorites"),
    enabled,
    staleTime: 60 * 1000,
  })
  return {
    ...query,
    enabled,
    ids: new Set(query.data?.ids ?? []),
    count: query.data?.ids.length ?? 0,
  }
}

/** Optimistic save/unsave with rollback. */
export function useToggleFavorite() {
  const t = useTranslations("common.favorites")
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ gearId, save }: { gearId: string; save: boolean }) => {
      const res = save ? await saveGear(gearId) : await unsaveGear(gearId)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    onMutate: async ({ gearId, save }) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.all })
      const previous = queryClient.getQueryData<Favorites>(favoriteKeys.all)
      queryClient.setQueryData<Favorites>(favoriteKeys.all, (current) => {
        const base = current ?? { ids: [], items: [] }
        return save
          ? {
              ...base,
              ids: [gearId, ...base.ids.filter((id) => id !== gearId)],
            }
          : {
              ids: base.ids.filter((id) => id !== gearId),
              items: base.items.filter((item) => item.id !== gearId),
            }
      })
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(favoriteKeys.all, context.previous)
      }
      toast.error(error.message || t("updateFailed"))
    },
    // Refetch so the Saved page gets full items for anything just added.
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all }),
  })
}
