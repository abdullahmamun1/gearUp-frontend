"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import type { DateRange } from "react-day-picker"
import { useQueryClient } from "@tanstack/react-query"
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
import { formatDate, formatPrice } from "@/utils/format"
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
      ? `Rentals can be at most ${RENTAL_POLICY.maxRentalDays} days.`
      : range?.from && range.from > lastStart
        ? `You can book up to ${RENTAL_POLICY.maxDaysAhead} days ahead.`
        : freeForRange === 0
          ? "Some of those days are fully booked. Try other dates."
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
        toast.error(res.message || "Couldn't place your order.")
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
    <div className="rounded-xl border bg-card p-4">
      <p className="font-heading text-sm font-semibold">Rent this gear</p>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Rental dates</Label>
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
                    ? `${formatDate(range.from.toISOString())} → ${formatDate(range.to.toISOString())}`
                    : "Pick your dates"}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
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
                  ? "Checking availability…"
                  : availability.isError
                    ? "Couldn't load availability. Your dates are checked when you book."
                    : "Greyed-out days are fully booked. Pick the day you'll return it as the end date."}
              </p>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Quantity</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              aria-label="Decrease quantity"
              disabled={effectiveQuantity <= 1}
              onClick={() => setQuantity(Math.max(1, effectiveQuantity - 1))}
            >
              <Minus className="size-3.5" aria-hidden />
            </Button>
            <span
              className="w-8 text-center text-sm tabular-nums"
              aria-live="polite"
            >
              {effectiveQuantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              aria-label="Increase quantity"
              disabled={effectiveQuantity >= maxQuantity}
              onClick={() =>
                setQuantity(Math.min(maxQuantity, effectiveQuantity + 1))
              }
            >
              <Plus className="size-3.5" aria-hidden />
            </Button>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {freeForRange === null
                ? `${stock} ${stock === 1 ? "unit" : "units"} in total`
                : `${freeForRange} left for these dates`}
            </span>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <dl className="grid gap-1.5 text-sm">
        <Row label="Price per day" value={formatPrice(pricePerDay)} muted />
        <Row
          label="Days"
          value={days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : "—"}
          muted
        />
        <Row label="Quantity" value={String(effectiveQuantity)} muted />
        <Row label="Rental" value={days > 0 ? formatPrice(rental) : "—"} />
        {depositAmount > 0 && (
          <Row label="Refundable deposit" value={formatPrice(deposit)} muted />
        )}
        <Row
          label={depositAmount > 0 ? "Due at payment" : "Total"}
          value={days > 0 ? formatPrice(rental + deposit) : "—"}
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
        size="lg"
        onClick={submit}
        disabled={!canSubmit || isPending}
        className="mt-4 h-11 w-full cursor-pointer text-sm"
      >
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isPending ? "Placing order…" : "Request to rent"}
      </Button>

      <div className="mt-3 grid gap-1.5 text-xs text-muted-foreground">
        <p>
          {days > 0
            ? `The provider has up to ${RENTAL_POLICY.respondWithinHours} hours to confirm. You pay only after they do.`
            : "Pick a start and end date to see your total."}
        </p>
        <p className="flex items-start gap-1.5">
          <ShieldCheck className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            Free cancellation until you pay. Paid rentals are fully refunded up
            to {RENTAL_POLICY.freeCancellationHours} hours before the start day
            {depositAmount > 0 &&
              ", and the deposit comes back when the gear is returned in good condition"}
            .
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
