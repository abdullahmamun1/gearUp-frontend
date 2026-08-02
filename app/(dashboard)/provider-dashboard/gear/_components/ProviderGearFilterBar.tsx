"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { X } from "lucide-react"

import { FilterField } from "@/components/shared/FilterField"
import { SearchInput } from "@/components/shared/SearchInput"
import { SelectField } from "@/components/shared/SelectField"
import { Button } from "@/components/ui/button"
import {
  AVAILABILITY_OPTIONS,
  buildProviderGearHref,
  hasActiveProviderGearFilters,
  PROVIDER_GEAR_PATH,
  PROVIDER_GEAR_SORT_OPTIONS,
  type Availability,
  type ProviderGearFilters,
  type ProviderGearSort,
} from "@/lib/providerGearQuery"
import type { Category } from "@/types"

const ALL_CATEGORIES = "all"
const SEARCH_DEBOUNCE_MS = 500

export function ProviderGearFilterBar({
  filters,
  categories,
}: {
  filters: ProviderGearFilters
  categories: Category[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm ?? "")

  const categoryItems = [
    { value: ALL_CATEGORIES, label: "All categories" },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ]

  function apply(overrides: Partial<ProviderGearFilters> = {}) {
    startTransition(() =>
      router.push(
        buildProviderGearHref({
          ...filters,
          searchTerm: searchTerm.trim() || undefined,
          ...overrides,
          page: 1,
        })
      )
    )
  }

  const activeSearch = filters.searchTerm ?? ""
  useEffect(() => {
    const typed = searchTerm.trim()
    if (typed === activeSearch) return

    const timer = setTimeout(() => {
      startTransition(() =>
        router.replace(
          buildProviderGearHref({
            ...filters,
            searchTerm: typed || undefined,
            page: 1,
          })
        )
      )
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchTerm, activeSearch, filters, router])

  function clearAll() {
    setSearchTerm("")
    startTransition(() => router.push(PROVIDER_GEAR_PATH))
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        apply()
      }}
      className="mb-6 grid gap-4 rounded-xl border bg-card p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterField label="Search" className="lg:col-span-2">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search your listings…"
            label="Search your gear"
            isPending={isPending}
          />
        </FilterField>

        <FilterField label="Category">
          <SelectField
            options={categoryItems}
            value={filters.category ?? ALL_CATEGORIES}
            onValueChange={(value) =>
              apply({ category: value === ALL_CATEGORIES ? undefined : value })
            }
            className="h-9 w-full text-sm"
          />
        </FilterField>

        <FilterField label="Availability">
          <SelectField
            options={AVAILABILITY_OPTIONS}
            value={filters.availability}
            onValueChange={(value) =>
              apply({ availability: (value as Availability) || "all" })
            }
            className="h-9 w-full text-sm"
          />
        </FilterField>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SelectField
          options={PROVIDER_GEAR_SORT_OPTIONS}
          value={filters.sort}
          onValueChange={(value) => apply({ sort: value as ProviderGearSort })}
          aria-label="Sort listings"
          className="h-9 w-full text-sm sm:w-52"
        />

        {hasActiveProviderGearFilters(filters) && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={clearAll}
            disabled={isPending}
            className="h-8 gap-1.5 text-xs text-muted-foreground"
          >
            <X className="size-3.5" aria-hidden />
            Clear filters
          </Button>
        )}

        <Button type="submit" size="lg" className="ml-auto h-9 text-sm">
          Apply
        </Button>
      </div>
    </form>
  )
}
