"use client"

import { useTransition } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocale } from "next-intl"
import { Loader2, Sparkles } from "lucide-react"

import { suggestSearches } from "@/api/ai"
import { useRouter } from "@/i18n/navigation"
import type { AppLocale } from "@/i18n/routing"
import { useTranslations } from "@/i18n/translations"
import { cn } from "@/lib/utils"
import type { SearchSuggestion } from "@/types"
import { buildGearHref, type GearFilters } from "@/utils/filters/gear"

/**
 * AI search suggestions: once a search is typed (the bar commits it to the
 * URL after a pause), Gemini turns it into a few precise searches built
 * from real categories, cities and catalogue words. One tap applies them.
 * Hidden when the AI is unavailable; plain search keeps working either way.
 */
export function AiSearchSuggestions({ filters }: { filters: GearFilters }) {
  const t = useTranslations("gear.aiSuggest")
  const locale = useLocale() as AppLocale
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const q = filters.searchTerm?.trim() ?? ""

  const query = useQuery({
    queryKey: ["ai-search-suggest", locale, q.toLowerCase()],
    queryFn: async () => {
      const res = await suggestSearches(q, locale)
      if (!res.success) throw new Error(res.message)
      return res.data.suggestions
    },
    enabled: q.length >= 3,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })

  if (q.length < 3 || query.isError) return null
  if (!query.isPending && (query.data?.length ?? 0) === 0) return null

  function apply(suggestion: SearchSuggestion) {
    startTransition(() =>
      router.push(
        buildGearHref({
          ...filters,
          searchTerm: suggestion.searchTerm,
          category: suggestion.categoryId ?? filters.category,
          city: suggestion.city ?? filters.city,
          maxPrice:
            suggestion.maxPricePerDay !== undefined
              ? String(suggestion.maxPricePerDay)
              : filters.maxPrice,
          ...(suggestion.city && { near: undefined, radius: undefined }),
          page: 1,
        }),
        { scroll: false }
      )
    )
  }

  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-2"
      aria-live="polite"
      aria-busy={query.isPending || undefined}
    >
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        <Sparkles className="size-4" aria-hidden />
        {t("label")}
      </span>
      {query.isPending ? (
        <>
          <span className="h-8 w-40 animate-pulse rounded-full bg-muted" />
          <span className="h-8 w-32 animate-pulse rounded-full bg-muted" />
          <span className="sr-only">{t("loading")}</span>
        </>
      ) : (
        query.data!.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            onClick={() => apply(suggestion)}
            disabled={isPending}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center rounded-full border border-primary/30 bg-primary/5 px-3.5 text-sm font-medium transition-colors hover:bg-primary/10 disabled:opacity-60"
            )}
          >
            {suggestion.label}
          </button>
        ))
      )}
      {isPending && (
        <Loader2
          className="size-4 animate-spin text-muted-foreground"
          aria-hidden
        />
      )}
    </div>
  )
}
