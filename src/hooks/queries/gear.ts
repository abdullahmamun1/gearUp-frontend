"use client"

import { useQuery } from "@tanstack/react-query"

import { queryFetch } from "@/hooks/queries/fetcher"
import type { GearAvailability } from "@/types"

export const gearAvailabilityKeys = {
  all: ["gear-availability"] as const,
  gear: (gearId: string) => [...gearAvailabilityKeys.all, gearId] as const,
}

export function useGearAvailability(gearId: string, from: string, to: string) {
  return useQuery({
    queryKey: [...gearAvailabilityKeys.gear(gearId), from, to],
    queryFn: () =>
      queryFetch<GearAvailability>(
        `/api/gear/${gearId}/availability?from=${from}&to=${to}`
      ),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}
