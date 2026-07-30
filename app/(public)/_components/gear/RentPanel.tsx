"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { CalendarDays, Loader2, Minus, Plus } from "lucide-react"

import { createRental } from "../../_actions/createRental"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { formatDate, formatPrice } from "@/lib/format"
import {
  rentalDays,
  rentalTotal,
  startOfToday,
  toDateValue,
} from "@/lib/rental"

export function RentPanel({
  gearId,
  pricePerDay,
  stock,
}: {
  gearId: string
  pricePerDay: string
  stock: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [range, setRange] = useState<DateRange | undefined>()
  const [quantity, setQuantity] = useState(1)
  const [open, setOpen] = useState(false)

  const today = startOfToday()
  const days = range?.from && range?.to ? rentalDays(range.from, range.to) : 0
  const total = rentalTotal(pricePerDay, quantity, days)
  const canSubmit = days > 0 && quantity > 0 && quantity <= stock

  function submit() {
    if (!range?.from || !range?.to) return

    startTransition(async () => {
      const res = await createRental({
        gearItemId: gearId,
        quantity,
        startDate: toDateValue(range.from!),
        endDate: toDateValue(range.to!),
      })

      if (!res.success) {
        toast.error(res.message || "Couldn't place your order.")
        return
      }

      router.push(`/customer-dashboard/orders/${res.data.id}?placed=1`)
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
                disabled={{ before: today }}
              />
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
              disabled={quantity <= 1}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <Minus className="size-3.5" aria-hidden />
            </Button>
            <span
              className="w-8 text-center text-sm tabular-nums"
              aria-live="polite"
            >
              {quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              aria-label="Increase quantity"
              disabled={quantity >= stock}
              onClick={() => setQuantity((value) => Math.min(stock, value + 1))}
            >
              <Plus className="size-3.5" aria-hidden />
            </Button>
            <span className="text-xs text-muted-foreground">
              {stock} available
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
        <Row label="Quantity" value={String(quantity)} muted />
        <Row
          label="Total"
          value={days > 0 ? formatPrice(total) : "—"}
          emphasis
        />
      </dl>

      <Button
        type="button"
        size="lg"
        onClick={submit}
        disabled={!canSubmit || isPending}
        className="mt-4 h-11 w-full cursor-pointer text-sm"
      >
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isPending ? "Placing order…" : "Rent now"}
      </Button>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        {days > 0
          ? "You'll pay after the order is placed."
          : "Pick a start and end date to see your total."}
      </p>
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
