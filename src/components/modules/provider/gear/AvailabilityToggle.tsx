"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { updateGear } from "@/api/gear"
import { Switch } from "@/components/ui/switch"
import { gearAvailability } from "@/utils/gearAvailability"
import type { ProviderGearFilters } from "@/utils/filters/providerGear"
import { providerGearKeys } from "@/hooks/queries/providerGear"
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
  const t = useTranslations("provider.availability")
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
      toast.error(error.message || t("failed"))
    },

    onSuccess: (_data, next) => {
      toast.success(
        next
          ? t("nowAvailable", { name: gear.name })
          : t("noLongerRentable", { name: gear.name })
      )
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  const available = gear.isAvailable
  const label = t(`label.${gearAvailability(gear)}`)

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={available}
        onCheckedChange={(next) => mutate(next)}
        disabled={isPending}
        tone="status"
        aria-label={
          available
            ? t("markUnavailable", { name: gear.name })
            : t("markAvailable", { name: gear.name })
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
