"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { updateGear } from "@/app/(dashboard)/_actions/updateGear"
import { Switch } from "@/components/ui/switch"
import { AVAILABILITY_LABEL, gearAvailability } from "@/lib/gearAvailability"
import type { ProviderGearFilters } from "@/lib/providerGearQuery"
import { providerGearKeys } from "@/lib/queries/providerGear"
import { cn } from "@/lib/utils"
import type { GearItem, Paginated } from "@/types"

export function AvailabilityToggle({
  gear,
  filters,
}: {
  gear: GearItem
  filters: ProviderGearFilters
}) {
  const queryClient = useQueryClient()
  const queryKey = providerGearKeys.list(filters)

  const { mutate, isPending } = useMutation({
    mutationFn: async (next: boolean) => {
      const res = await updateGear(gear.id, { isAvailable: next })
      if (!res.success) throw new Error(res.message)
      return res.data
    },

    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Paginated<GearItem>>(queryKey)

      queryClient.setQueryData<Paginated<GearItem>>(queryKey, (current) =>
        current
          ? {
              ...current,
              data: current.data.map((item) =>
                item.id === gear.id ? { ...item, isAvailable: next } : item
              ),
            }
          : current
      )

      return { previous }
    },

    onError: (error, _next, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
      toast.error(error.message || "Couldn't change availability.")
    },

    onSuccess: (_data, next) => {
      toast.success(
        next
          ? `"${gear.name}" is available to rent.`
          : `"${gear.name}" is no longer rentable.`
      )
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  const available = gear.isAvailable
  const label = AVAILABILITY_LABEL[gearAvailability(gear)]

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={available}
        onCheckedChange={(next) => mutate(next)}
        disabled={isPending}
        tone="status"
        aria-label={
          available
            ? `Mark ${gear.name} unavailable`
            : `Mark ${gear.name} available`
        }
      />
      <span
        className={cn(
          "text-xs whitespace-nowrap",
          available ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  )
}
