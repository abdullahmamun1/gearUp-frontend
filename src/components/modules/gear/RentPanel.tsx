"use client"

import { useRouter } from "@/i18n/navigation"
import { useMemo, useState, useTransition } from "react"
import type { DateRange } from "react-day-picker"
import { bn } from "react-day-picker/locale"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"
import { CalendarDays, Loader2, Minus, Plus, ShieldCheck } from "lucide-react"

import { createRental } from "@/api/rentals"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useFormat } from "@/i18n/useFormat"
import { gearAvailabilityKeys, useGearAvailability } from "@/hooks/queries/gear"
import {
  addDays,
  RENTAL_POLICY,
  rentalDays,
  rentalTotal,
  startOfToday,
  toDateValue,
} from "@/utils/rental"

export function RentPanel({
  gearId,
  pricePerDay,
  depositAmount,
  stock,
}: {
  gearId: string
  pricePerDay: string
  depositAmount: number
  stock: number
}) {
  const t = useTranslations("gear.rent")
  const tCommon = useTranslations("common")
  const format = useFormat()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [range, setRange] = useState<DateRange | undefined>()
  const [quantity, setQuantity] = useState(1)
  const [open, setOpen] = useState(false)

  const today = startOfToday()
  const lastStart = addDays(today, RENTAL_POLICY.maxDaysAhead)
  const lastEnd = addDays(lastStart, RENTAL_POLICY.maxRentalDays)
  const availability = useGearAvailability(
    gearId,
    toDateValue(today),
    toDateValue(lastEnd)
  )

  const freeByDay = useMemo(
    () =>
      new Map(
        (availability.data?.days ?? []).map((day) => [day.date, day.available])
      ),
    [availability.data]
  )

  const days = range?.from && range?.to ? rentalDays(range.from, range.to) : 0

  // Fewest units free on any held day; the end (return) day isn't held.
  let freeForRange: number | null = null
  if (range?.from && days > 0 && availability.data) {
    freeForRange = stock
    for (let day = 0; day < days; day++) {
      const key = toDateValue(addDays(range.from, day))
      freeForRange = Math.min(freeForRange, freeByDay.get(key) ?? 0)
    }
  }

  const maxQuantity = freeForRange ?? stock
  const effectiveQuantity = Math.min(quantity, Math.max(maxQuantity, 1))
  const rental = rentalTotal(pricePerDay, effectiveQuantity, days)
  const deposit = depositAmount * effectiveQuantity

  const problem =
    days > RENTAL_POLICY.maxRentalDays
      ? t("tooLong", { days: RENTAL_POLICY.maxRentalDays })
      : range?.from && range.from > lastStart
        ? t("tooFarAhead", { days: RENTAL_POLICY.maxDaysAhead })
        : freeForRange === 0
          ? t("fullyBooked")
          : null

  const canSubmit =
    days > 0 &&
    !problem &&
    availability.isSuccess &&
    effectiveQuantity <= maxQuantity

  function isBooked(date: Date) {
    return freeByDay.get(toDateValue(date)) === 0
  }

  function submit() {
    if (!range?.from || !range?.to) return

    startTransition(async () => {
      const res = await createRental({
        gearItemId: gearId,
        quantity: effectiveQuantity,
        startDate: toDateValue(range.from!),
        endDate: toDateValue(range.to!),
      })

      if (!res.success) {
        toast.error(res.message || t("placeFailed"))
        // Someone may have just booked the last unit.
        queryClient.invalidateQueries({
          queryKey: gearAvailabilityKeys.gear(gearId),
        })
        return
      }

      router.push(`/dashboard/customer/orders/${res.data.id}?placed=1`)
    })
  }

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-xs">
      <p className="font-heading text-sm font-semibold">{t("title")}</p>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">{t("dates")}</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  size="lg"
                  className="h-9 justify-start gap-2 text-sm font-normal"
                >
                  <CalendarDays
                    className="size-4 text-muted-foreground"
                    aria-hidden
                  />
                  {range?.from && range?.to
                    ? `${format.date(range.from.toISOString())} → ${format.date(range.to.toISOString())}`
                    : t("pickDates")}
                </Button>
              }
            />
            <PopoverContent className="w-min p-0" align="start">
              <Calendar
                locale={format.locale === "bn" ? bn : undefined}
                numerals={format.locale === "bn" ? "beng" : undefined}
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={1}
                autoFocus
                excludeDisabled
                disabled={[{ before: today }, { after: lastEnd }, isBooked]}
              />
              <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                {availability.isPending
                  ? t("checking")
                  : availability.isError
                    ? t("availabilityFailed")
                    : t("calendarHint")}
              </p>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("quantity")}
          </Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              aria-label={t("decrease")}
              disabled={effectiveQuantity <= 1}
              onClick={() => setQuantity(Math.max(1, effectiveQuantity - 1))}
            >
              <Minus className="size-3.5" aria-hidden />
            </Button>
            <span
              className="w-8 text-center text-sm tabular-nums"
              aria-live="polite"
            >
              {format.number(effectiveQuantity)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              aria-label={t("increase")}
              disabled={effectiveQuantity >= maxQuantity}
              onClick={() =>
                setQuantity(Math.min(maxQuantity, effectiveQuantity + 1))
              }
            >
              <Plus className="size-3.5" aria-hidden />
            </Button>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {freeForRange === null
                ? t("unitsTotal", { count: stock })
                : t("unitsLeft", { count: freeForRange })}
            </span>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <dl className="grid gap-1.5 text-sm">
        <Row label={t("pricePerDay")} value={format.price(pricePerDay)} muted />
        <Row
          label={t("days")}
          value={days > 0 ? tCommon("units.days", { count: days }) : "—"}
          muted
        />
        <Row
          label={t("quantity")}
          value={format.number(effectiveQuantity)}
          muted
        />
        <Row
          label={t("rental")}
          value={days > 0 ? format.price(rental) : "—"}
        />
        {depositAmount > 0 && (
          <Row label={t("deposit")} value={format.price(deposit)} muted />
        )}
        <Row
          label={depositAmount > 0 ? t("dueAtPayment") : t("total")}
          value={days > 0 ? format.price(rental + deposit) : "—"}
          emphasis
        />
      </dl>

      {problem && (
        <p className="mt-3 text-xs text-destructive" role="alert">
          {problem}
        </p>
      )}

      <Button
        type="button"
        variant="cta"
        size="lg"
        onClick={submit}
        disabled={!canSubmit || isPending}
        className="mt-4 h-11 w-full cursor-pointer text-sm"
      >
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isPending ? t("placing") : t("request")}
      </Button>

      <div className="mt-3 grid gap-1.5 text-xs text-muted-foreground">
        <p>
          {days > 0
            ? t("respondNote", { hours: RENTAL_POLICY.respondWithinHours })
            : t("pickToSeeTotal")}
        </p>
        <p className="flex items-start gap-1.5">
          <ShieldCheck className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            {depositAmount > 0
              ? t("cancellationWithDeposit", {
                  hours: RENTAL_POLICY.freeCancellationHours,
                })
              : t("cancellation", {
                  hours: RENTAL_POLICY.freeCancellationHours,
                })}
          </span>
        </p>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  muted,
  emphasis,
}: {
  label: string
  value: string
  muted?: boolean
  emphasis?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={muted ? "text-muted-foreground" : undefined}>{label}</dt>
      <dd
        className={
          emphasis ? "font-heading text-base font-semibold" : "tabular-nums"
        }
      >
        {value}
      </dd>
    </div>
  )
}
