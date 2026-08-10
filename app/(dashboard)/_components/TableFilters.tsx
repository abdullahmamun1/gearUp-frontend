"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { X } from "lucide-react"

import { FilterField } from "@/components/shared/FilterField"
import { SearchInput } from "@/components/shared/SearchInput"
import { SelectField, type SelectOption } from "@/components/shared/SelectField"
import { Button } from "@/components/ui/button"
import { buildHref } from "@/lib/searchParams"

const ALL = "all"
const SEARCH_DEBOUNCE_MS = 500

export type FilterSpec = {
  name: string
  label: string
  value?: string
  options: SelectOption[]
}

export type SearchSpec = {
  name: string
  label: string
  placeholder: string
  value?: string
}

export function TableFilters({
  basePath,
  specs = [],
  search,
}: {
  basePath: string
  specs?: FilterSpec[]
  search?: SearchSpec
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [term, setTerm] = useState(search?.value ?? "")

  const current: Record<string, string | undefined> = Object.fromEntries(
    specs.map((spec) => [spec.name, spec.value])
  )
  if (search) current[search.name] = search.value

  const hasActive = specs.some((spec) => spec.value) || Boolean(search?.value)

  function apply(name: string, value: string | undefined) {
    startTransition(() =>
      router.push(buildHref(basePath, { ...current, [name]: value, page: 1 }))
    )
  }

  const activeTerm = search?.value ?? ""
  useEffect(() => {
    if (!search) return

    const typed = term.trim()
    if (typed === activeTerm) return

    const timer = setTimeout(() => {
      startTransition(() =>
        router.replace(
          buildHref(basePath, {
            ...current,
            [search.name]: typed || undefined,
            page: 1,
          })
        )
      )
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, activeTerm])

  function clearAll() {
    setTerm("")
    startTransition(() => router.push(basePath))
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
      {search && (
        <FilterField label={search.label} className="min-w-56 flex-1">
          <SearchInput
            value={term}
            onChange={setTerm}
            placeholder={search.placeholder}
            label={search.label}
            isPending={isPending}
          />
        </FilterField>
      )}

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
          onClick={clearAll}
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
