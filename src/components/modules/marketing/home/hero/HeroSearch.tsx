"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search } from "lucide-react"

import { DateRangePicker } from "@/components/shared/DateRangePicker"
import { Button } from "@/components/ui/button"
import { buildGearHref, DEFAULT_GEAR_FILTERS } from "@/utils/filters/gear"

/**
 * What + when. A plain GET form to /gear, so it works before hydration;
 * with JavaScript it adds trip dates and navigates client-side.
 */
export function HeroSearch() {
  const router = useRouter()
  const [term, setTerm] = useState("")
  const [dates, setDates] = useState<{ from?: string; to?: string }>({})

  return (
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
        <span className="sr-only">What do you need?</span>
        <input
          type="search"
          name="searchTerm"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Tents, kayaks, bikes…"
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
      <Button type="submit" size="lg" className="h-11 rounded-xl px-6 text-sm">
        Search
      </Button>
    </form>
  )
}
