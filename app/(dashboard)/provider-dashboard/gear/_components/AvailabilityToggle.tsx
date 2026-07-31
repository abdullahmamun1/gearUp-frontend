"use client"

import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"

import { updateGear } from "@/app/(dashboard)/_actions/updateGear"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { GearItem } from "@/types"

export function AvailabilityToggle({ gear }: { gear: GearItem }) {
  const [isPending, startTransition] = useTransition()
  const [available, setAvailable] = useOptimistic(gear.isAvailable)

  const label = !available
    ? "Unavailable"
    : gear.stock < 1
      ? "Out of stock"
      : "Available"

  function toggle(next: boolean) {
    startTransition(async () => {
      setAvailable(next)
      const res = await updateGear(gear.id, { isAvailable: next })

      if (!res.success) {
        toast.error(res.message || "Couldn't change availability.")
        return
      }

      toast.success(
        next
          ? `"${gear.name}" is available to rent.`
          : `"${gear.name}" is no longer rentable.`
      )
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={available}
        onCheckedChange={toggle}
        disabled={isPending}
        className="bg-destructive dark:bg-destructive data-checked:bg-success dark:data-checked:bg-success"
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
