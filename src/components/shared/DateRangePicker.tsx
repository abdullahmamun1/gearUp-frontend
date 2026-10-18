"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { bn } from "react-day-picker/locale"
import { useLocale } from "next-intl"
import { useTranslations } from "@/i18n/translations"
import { CalendarDays, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useFormat } from "@/i18n/useFormat"
import {
  addDays,
  fromDateValue,
  RENTAL_POLICY,
  startOfToday,
  toDateValue,
} from "@/utils/rental"

/** Trip dates ("YYYY-MM-DD" from/to), used by the browse filters and the hero. */
export function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from?: string
  to?: string
  onChange: (from?: string, to?: string) => void
}) {
  const t = useTranslations("common.dateRange")
  const format = useFormat()
  const isBangla = useLocale() === "bn"
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
                ? t("range", {
                    from: format.date(from),
                    to: format.date(to),
                  })
                : t("any")}
            </Button>
          }
        />
        <PopoverContent className="w-min p-0" align="start">
          <Calendar
            mode="range"
            selected={draft}
            onSelect={select}
            numberOfMonths={1}
            autoFocus
            locale={isBangla ? bn : undefined}
            numerals={isBangla ? "beng" : undefined}
            max={RENTAL_POLICY.maxRentalDays}
            disabled={[
              { before: today },
              { after: addDays(today, RENTAL_POLICY.maxDaysAhead) },
            ]}
          />
          <p className="border-t px-3 py-2 text-xs text-muted-foreground">
            {t("hint")}
          </p>
        </PopoverContent>
      </Popover>
      {from && to && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label={t("clear")}
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
