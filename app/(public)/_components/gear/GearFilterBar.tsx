"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { X } from "lucide-react"

import { FilterField } from "@/components/shared/FilterField"
import { SearchInput } from "@/components/shared/SearchInput"
import { SelectField } from "@/components/shared/SelectField"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  buildGearHref,
  DEFAULT_SORT,
  hasActiveFilters,
  SORT_OPTIONS,
  type GearFilters,
} from "@/lib/gearQuery"
import type { Category } from "@/types"

const ALL_CATEGORIES = "all"
const ALL_BRANDS = "__all_brands__"
const SEARCH_DEBOUNCE_MS = 500

export function GearFilterBar({
  filters,
  categories,
  brands,
}: {
  filters: GearFilters
  categories: Category[]
  brands: string[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm ?? "")
  const [minPrice, setMinPrice] = useState(filters.minPrice ?? "")
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ?? "")

  const categoryItems = [
    { value: ALL_CATEGORIES, label: "All categories" },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ]

  const brandNames =
    filters.brand && !brands.includes(filters.brand)
      ? [...brands, filters.brand].sort((a, b) => a.localeCompare(b))
      : brands

  const brandItems = [
    { value: ALL_BRANDS, label: "All brands" },
    ...brandNames.map((brand) => ({ value: brand, label: brand })),
  ]

  function hrefWith(overrides: Partial<GearFilters> = {}): string {
    return buildGearHref({
      ...filters,
      searchTerm: searchTerm.trim() || undefined,
      minPrice: minPrice.trim() || undefined,
      maxPrice: maxPrice.trim() || undefined,
      ...overrides,
      page: 1,
    })
  }

  function apply(overrides: Partial<GearFilters> = {}) {
    startTransition(() => router.push(hrefWith(overrides)))
  }

  const activeSearch = filters.searchTerm ?? ""
  useEffect(() => {
    const typed = searchTerm.trim()
    if (typed === activeSearch) return

    const timer = setTimeout(() => {
      startTransition(() =>
        router.replace(
          buildGearHref({
            ...filters,
            searchTerm: typed || undefined,
            minPrice: minPrice.trim() || undefined,
            maxPrice: maxPrice.trim() || undefined,
            page: 1,
          })
        )
      )
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchTerm, activeSearch, minPrice, maxPrice, filters, router])

  function clearAll() {
    setSearchTerm("")
    setMinPrice("")
    setMaxPrice("")
    startTransition(() => router.push("/gear"))
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        apply()
      }}
      className="mt-6 grid gap-4 rounded-xl border bg-card p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search tents, kayaks, bikes…"
          label="Search gear"
          isPending={isPending}
        />

        <SelectField
          options={SORT_OPTIONS}
          value={filters.sort}
          onValueChange={(value) =>
            apply({ sort: (value as GearFilters["sort"]) || DEFAULT_SORT })
          }
          aria-label="Sort results"
          className="h-9 w-full text-sm sm:w-52"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterField label="Category">
          <SelectField
            options={categoryItems}
            value={filters.category ?? ALL_CATEGORIES}
            onValueChange={(value) =>
              apply({
                category: value === ALL_CATEGORIES ? undefined : value,
              })
            }
            className="h-9 w-full text-sm"
          />
        </FilterField>

        {brandNames.length > 0 && (
          <FilterField label="Brand">
            <SelectField
              options={brandItems}
              value={filters.brand ?? ALL_BRANDS}
              onValueChange={(value) =>
                apply({ brand: value === ALL_BRANDS ? undefined : value })
              }
              className="h-9 w-full text-sm"
            />
          </FilterField>
        )}

        <FilterField label="Min price / day">
          <Input
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            inputMode="decimal"
            placeholder="0"
            className="h-9 text-sm"
          />
        </FilterField>

        <FilterField label="Max price / day">
          <Input
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            inputMode="decimal"
            placeholder="Any"
            className="h-9 text-sm"
          />
        </FilterField>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={filters.availableOnly}
            onCheckedChange={(checked) =>
              apply({ availableOnly: Boolean(checked) })
            }
          />
          Available only
        </label>

        <Button type="submit" size="lg" className="ml-auto h-9 text-sm">
          Apply
        </Button>
      </div>

      {hasActiveFilters(filters) && (
        <div>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={clearAll}
            disabled={isPending}
            className="h-8 gap-1.5 text-xs text-muted-foreground"
          >
            <X className="size-3.5" aria-hidden />
            Clear all filters
          </Button>
        </div>
      )}
    </form>
  )
}
