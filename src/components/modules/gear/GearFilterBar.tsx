"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import type { DateRange } from "react-day-picker"
import { CalendarDays, X } from "lucide-react"

import { FilterField } from "@/components/shared/FilterField"
import { SearchInput } from "@/components/shared/SearchInput"
import { SelectField } from "@/components/shared/SelectField"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDate } from "@/utils/format"
import {
  buildGearHref,
  DEFAULT_SORT,
  hasActiveFilters,
  SORT_OPTIONS,
  type GearFilters,
} from "@/utils/filters/gear"
import {
  addDays,
  fromDateValue,
  RENTAL_POLICY,
  startOfToday,
  toDateValue,
} from "@/utils/rental"
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

        <FilterField label="Dates">
          <DateRangeFilter
            from={filters.from}
            to={filters.to}
            onChange={(from, to) => apply({ from, to })}
          />
        </FilterField>

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

function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from?: string
  to?: string
  onChange: (from?: string, to?: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>(
    from && to
      ? { from: fromDateValue(from), to: fromDateValue(to) }
      : undefined
  )
  const today = startOfToday()

  function select(range: DateRange | undefined) {
    setDraft(range)
    if (range?.from && range.to && range.to > range.from) {
      setOpen(false)
      onChange(toDateValue(range.from), toDateValue(range.to))
    }
  }

  return (
    <div className="flex gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-9 flex-1 justify-start gap-2 text-sm font-normal"
            >
              <CalendarDays
                className="size-4 text-muted-foreground"
                aria-hidden
              />
              {from && to
                ? `${formatDate(from)} → ${formatDate(to)}`
                : "Any dates"}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={draft}
            onSelect={select}
            numberOfMonths={1}
            autoFocus
            max={RENTAL_POLICY.maxRentalDays}
            disabled={[
              { before: today },
              { after: addDays(today, RENTAL_POLICY.maxDaysAhead) },
            ]}
          />
          <p className="border-t px-3 py-2 text-xs text-muted-foreground">
            Shows only gear that&apos;s free for your whole trip.
          </p>
        </PopoverContent>
      </Popover>
      {from && to && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label="Clear dates"
          onClick={() => {
            setDraft(undefined)
            onChange(undefined, undefined)
          }}
        >
          <X className="size-3.5" aria-hidden />
        </Button>
      )}
    </div>
  )
}
