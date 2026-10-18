"use client"

import { useRouter } from "@/i18n/navigation"
import { useEffect, useState, useTransition } from "react"
import { useTranslations } from "@/i18n/translations"
import { SlidersHorizontal, X } from "lucide-react"

import { DateRangePicker } from "@/components/shared/DateRangePicker"
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
} from "@/utils/filters/gear"

const ALL_BRANDS = "__all_brands__"
const SEARCH_DEBOUNCE_MS = 500

export function GearFilterBar({
  filters,
  brands,
}: {
  filters: GearFilters
  brands: string[]
}) {
  const t = useTranslations("gear.filters")
  const tGear = useTranslations("gear")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm ?? "")
  const [minPrice, setMinPrice] = useState(filters.minPrice ?? "")
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ?? "")
  // null until the visitor toggles it: then it follows the active filters.
  const [moreOpen, setMoreOpen] = useState<boolean | null>(null)

  const brandNames =
    filters.brand && !brands.includes(filters.brand)
      ? [...brands, filters.brand].sort((a, b) => a.localeCompare(b))
      : brands

  const brandItems = [
    { value: ALL_BRANDS, label: t("allBrands") },
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

  const extraFilters = [
    filters.brand,
    filters.minPrice,
    filters.maxPrice,
    filters.availableOnly || undefined,
  ].filter(Boolean).length
  const showMore = moreOpen ?? extraFilters > 0

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        apply()
      }}
      className="mt-6 rounded-2xl border bg-card p-3 shadow-sm sm:p-4"
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_15rem_13rem_auto]">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t("searchPlaceholder")}
          label={t("searchLabel")}
          isPending={isPending}
        />

        <div className="sm:order-last lg:order-none">
          <DateRangePicker
            from={filters.from}
            to={filters.to}
            onChange={(from, to) => apply({ from, to })}
          />
        </div>

        <SelectField
          options={SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: tGear(option.labelKey),
          }))}
          value={filters.sort}
          onValueChange={(value) =>
            apply({ sort: (value as GearFilters["sort"]) || DEFAULT_SORT })
          }
          aria-label={t("sortLabel")}
          className="h-9 w-full text-sm"
        />

        <Button
          type="button"
          variant={showMore ? "secondary" : "outline"}
          size="lg"
          aria-expanded={showMore}
          aria-controls="more-gear-filters"
          onClick={() => setMoreOpen(!showMore)}
          className="h-9 gap-2 text-sm"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          {t("toggle")}
          {extraFilters > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {extraFilters}
            </span>
          )}
        </Button>
      </div>

      {showMore && (
        <div
          id="more-gear-filters"
          className="mt-3 grid animate-in gap-3 border-t pt-4 duration-300 fade-in slide-in-from-top-1 motion-reduce:animate-none sm:grid-cols-2 lg:grid-cols-[1fr_10rem_10rem_auto_auto] lg:items-end"
        >
          {brandNames.length > 0 && (
            <FilterField label={t("brand")}>
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

          <FilterField label={t("minPrice")}>
            <Input
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="h-9 text-sm"
            />
          </FilterField>

          <FilterField label={t("maxPrice")}>
            <Input
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              inputMode="decimal"
              placeholder={t("anyPrice")}
              className="h-9 text-sm"
            />
          </FilterField>

          <label className="flex h-9 items-center gap-2 text-sm">
            <Checkbox
              checked={filters.availableOnly}
              onCheckedChange={(checked) =>
                apply({ availableOnly: Boolean(checked) })
              }
            />
            {t("availableNow")}
          </label>

          <Button type="submit" size="lg" className="h-9 px-5 text-sm">
            {t("apply")}
          </Button>
        </div>
      )}

      {hasActiveFilters(filters) && (
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={clearAll}
            disabled={isPending}
            className="h-8 gap-1.5 text-xs text-muted-foreground"
          >
            <X className="size-3.5" aria-hidden />
            {t("clearAll")}
          </Button>
        </div>
      )}
    </form>
  )
}
