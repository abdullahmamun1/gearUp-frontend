"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { buildAdminHref } from "@/lib/adminQuery"

const ALL = "all"

export type FilterSpec = {
  name: string
  label: string
  value?: string
  options: { value: string; label: string }[]
}

export function AdminFilters({
  basePath,
  specs,
}: {
  basePath: string
  specs: FilterSpec[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const current = Object.fromEntries(
    specs.map((spec) => [spec.name, spec.value])
  )
  const hasActive = specs.some((spec) => spec.value)

  function apply(name: string, value: string | undefined) {
    startTransition(() =>
      router.push(
        buildAdminHref(basePath, { ...current, [name]: value, page: 1 })
      )
    )
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
      {specs.map((spec) => {
        const items = [
          {
            value: ALL,
            label: spec.options.length
              ? `All ${spec.label.toLowerCase()}`
              : "All",
          },
          ...spec.options,
        ]

        return (
          <div key={spec.name} className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">
              {spec.label}
            </Label>
            <Select
              items={items}
              value={spec.value ?? ALL}
              onValueChange={(value) =>
                apply(spec.name, value === ALL ? undefined : String(value))
              }
            >
              <SelectTrigger className="h-9 w-44 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })}

      {hasActive && (
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => startTransition(() => router.push(basePath))}
          disabled={isPending}
          className="h-9 gap-1.5 text-xs text-muted-foreground"
        >
          <X className="size-3.5" aria-hidden />
          Clear filters
        </Button>
      )}
    </div>
  )
}
