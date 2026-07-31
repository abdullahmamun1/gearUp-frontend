"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { Loader2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
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
        <div className="grid gap-1.5 lg:col-span-2">
          <Label className="text-xs text-muted-foreground">Search</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search your listings…"
              aria-label="Search your gear"
              className="h-9 pr-9 pl-9 text-sm"
            />
            {isPending && (
              <Loader2
                className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                aria-hidden
              />
            )}
          </div>
        </div>

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

        <Field label="Availability">
          <Select
            items={AVAILABILITY_OPTIONS}
            value={filters.availability}
            onValueChange={(value) =>
              apply({ availability: (value as Availability) ?? "all" })
            }
          >
            <SelectTrigger className="h-9 w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABILITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          items={PROVIDER_GEAR_SORT_OPTIONS}
          value={filters.sort}
          onValueChange={(value) => apply({ sort: value as ProviderGearSort })}
        >
          <SelectTrigger
            className="h-9 w-full text-sm sm:w-52"
            aria-label="Sort listings"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROVIDER_GEAR_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
