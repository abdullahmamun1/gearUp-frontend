"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { X } from "lucide-react"

import { FilterField } from "@/components/shared/FilterField"
import { SelectField, type SelectOption } from "@/components/shared/SelectField"
import { Button } from "@/components/ui/button"
import { buildHref } from "@/lib/searchParams"

const ALL = "all"

export type FilterSpec = {
  name: string
  label: string
  value?: string
  options: SelectOption[]
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
      router.push(buildHref(basePath, { ...current, [name]: value, page: 1 }))
    )
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
      {specs.map((spec) => (
        <FilterField key={spec.name} label={spec.label}>
          <SelectField
            options={[
              { value: ALL, label: `All ${spec.label.toLowerCase()}` },
              ...spec.options,
            ]}
            value={spec.value ?? ALL}
            onValueChange={(value) =>
              apply(spec.name, value === ALL ? undefined : value)
            }
            className="h-9 w-44 text-sm"
          />
        </FilterField>
      ))}

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
