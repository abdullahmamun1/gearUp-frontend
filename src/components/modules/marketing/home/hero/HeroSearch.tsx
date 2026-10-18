"use client"

import { useRouter } from "@/i18n/navigation"
import { useState } from "react"
import { Search, Sparkles } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { openGearFinder } from "@/components/modules/ai/GearFinder"
import { DateRangePicker } from "@/components/shared/DateRangePicker"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { buildGearHref, DEFAULT_GEAR_FILTERS } from "@/utils/filters/gear"

const MODES = [
  { id: "search", label: "modeSearch", icon: Search },
  { id: "ai", label: "modeAi", icon: Sparkles },
] as const

/**
 * What + when, or "describe your trip". Search is a plain GET form to /gear,
 * so it works before hydration; Ask AI hands the description to the trip
 * planner.
 */
export function HeroSearch() {
  const t = useTranslations("home.search")
  const router = useRouter()
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("search")
  const [term, setTerm] = useState("")
  const [trip, setTrip] = useState("")
  const [dates, setDates] = useState<{ from?: string; to?: string }>({})

  return (
    <div>
      <div
        role="tablist"
        aria-label={t("modesLabel")}
        className="mb-2 inline-flex gap-1 rounded-full border bg-card/70 p-1 shadow-xs backdrop-blur-sm"
      >
        {MODES.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={mode === option.id}
            onClick={() => setMode(option.id)}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
              mode === option.id
                ? option.id === "ai"
                  ? "bg-(image:--gradient-brand) text-primary-foreground shadow-glow-primary"
                  : "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <option.icon className="size-3.5" aria-hidden />
            {t(option.label)}
          </button>
        ))}
      </div>

      {mode === "search" ? (
        <form
          action="/gear"
          onSubmit={(event) => {
            event.preventDefault()
            router.push(
              buildGearHref({
                ...DEFAULT_GEAR_FILTERS,
                searchTerm: term.trim() || undefined,
                from: dates.from,
                to: dates.to,
              })
            )
          }}
          className="flex flex-col gap-2 rounded-2xl border glass p-2 shadow-lg sm:flex-row sm:items-center"
        >
          <label className="flex flex-1 items-center gap-2.5 px-3">
            <Search
              className="size-[18px] shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="sr-only">{t("whatLabel")}</span>
            <input
              type="search"
              name="searchTerm"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder={t("placeholder")}
              className="h-11 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
          </label>
          <div className="sm:w-56">
            <DateRangePicker
              from={dates.from}
              to={dates.to}
              onChange={(from, to) => setDates({ from, to })}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-11 rounded-xl px-6 text-sm"
          >
            {t("submit")}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            openGearFinder(trip.trim() || undefined)
          }}
          className="flex flex-col gap-2 rounded-2xl border glass p-2 shadow-lg sm:flex-row sm:items-center"
        >
          <label className="flex flex-1 items-center gap-2.5 px-3">
            <Sparkles
              className="size-[18px] shrink-0 text-primary"
              aria-hidden
            />
            <span className="sr-only">{t("tripLabel")}</span>
            <input
              value={trip}
              onChange={(event) => setTrip(event.target.value)}
              maxLength={500}
              placeholder={t("tripPlaceholder")}
              className="h-11 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
          </label>
          <Button
            type="submit"
            variant="cta"
            size="lg"
            className="h-11 gap-1.5 rounded-xl px-6 text-sm"
          >
            <Sparkles className="size-4" aria-hidden />
            {t("planTrip")}
          </Button>
        </form>
      )}
    </div>
  )
}
