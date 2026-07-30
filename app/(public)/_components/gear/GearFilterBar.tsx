"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { Loader2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  buildGearHref,
  DEFAULT_SORT,
  hasActiveFilters,
  SORT_OPTIONS,
  type GearFilters,
} from "@/lib/gearQuery"
import type { Category } from "@/types"

const ALL_CATEGORIES = "all"
const SEARCH_DEBOUNCE_MS = 500

export function GearFilterBar({
  filters,
  categories,
}: {
  filters: GearFilters
  categories: Category[]
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
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search tents, kayaks, bikes…"
            aria-label="Search gear"
            className="h-9 pr-9 pl-9 text-sm"
          />
          {isPending && (
            <Loader2
              className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden
            />
          )}
        </div>

        <Select
          items={SORT_OPTIONS}
          value={filters.sort}
          onValueChange={(value) =>
            apply({ sort: (value as GearFilters["sort"]) ?? DEFAULT_SORT })
          }
        >
          <SelectTrigger
            className="h-9 w-full text-sm sm:w-52"
            aria-label="Sort results"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Category">
          <Select
            items={categoryItems}
            value={filters.category ?? ALL_CATEGORIES}
            onValueChange={(value) =>
              apply({
                category: value === ALL_CATEGORIES ? undefined : String(value),
              })
            }
          >
            <SelectTrigger className="h-9 w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Min price / day">
          <Input
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            inputMode="decimal"
            placeholder="0"
            className="h-9 text-sm"
          />
        </Field>

        <Field label="Max price / day">
          <Input
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            inputMode="decimal"
            placeholder="Any"
            className="h-9 text-sm"
          />
        </Field>

        <div className="flex items-end gap-3">
          <label className="flex flex-1 items-center gap-2 text-sm">
            <Checkbox
              checked={filters.availableOnly}
              onCheckedChange={(checked) =>
                apply({ availableOnly: Boolean(checked) })
              }
            />
            Available only
          </label>

          <Button type="submit" size="lg" className="h-9 text-sm">
            Apply
          </Button>
        </div>
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

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
