import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Backpack, CalendarDays, CheckCircle2 } from "lucide-react"

import { getRentalById } from "@/app/(dashboard)/_actions/getRentalById"
import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { Separator } from "@/components/ui/separator"
import { formatDate, formatPrice } from "@/lib/format"
import { rentalDays } from "@/lib/rental"
import type { OrderItem, RentalOrder } from "@/types"
import { CancelOrderButton } from "../_components/CancelOrderButton"
import { PayButton } from "../_components/PayButton"

export const metadata: Metadata = { title: "Rental details · GearUp" }

type Props = {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ placed?: string; paid?: string; cancelled?: string }>
}

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { orderId } = await params
  const { placed, paid, cancelled } = await searchParams
  const res = await getRentalById(orderId)

  if (!res.success && (res.statusCode === 404 || res.statusCode === 403)) {
    notFound()
  }

  if (!res.success || !res.data) {
    return (
      <p className="text-sm text-muted-foreground">
        {res.message || "Couldn't load this order. Please try again."}
      </p>
    )
  }

  const order = res.data
  const items = order.items ?? []
  const days = rentalDays(new Date(order.startDate), new Date(order.endDate))

  return (
    <>
      <Link
        href="/customer-dashboard/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        All rentals
      </Link>

      {paid === "1" && (
        <p className="mb-6 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden
          />
          <span>
            <span className="font-medium">Payment received.</span>{" "}
            {order.status === "PAID"
              ? "Your rental is confirmed — the provider will arrange pickup."
              : "Stripe is still confirming it; this page will show Paid shortly."}
          </span>
        </p>
      )}

      {cancelled === "1" && order.status !== "PAID" && (
        <p className="mb-6 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
          Checkout was cancelled — nothing has been charged. Your booking is
          still held, so you can pay whenever you&apos;re ready.
        </p>
      )}

      {placed === "1" && order.status === "PLACED" && (
        <p className="mb-6 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden
          />
          <span>
            <span className="font-medium">Your rental is booked.</span> The
            provider reviews it next — payment opens once they confirm.
          </span>
        </p>
      )}

      <PageHeader
        title={`Order ${order.id.slice(0, 8)}`}
        description={`Placed ${formatDate(order.createdAt)}`}
        action={
          <div className="flex items-center gap-3">
            <RentalStatusBadge status={order.status} />
            {order.status === "PLACED" && (
              <CancelOrderButton orderId={order.id} />
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-sm font-semibold">Gear</h2>
          <ul className="mt-3 grid gap-3">
            {items.map((item) => (
              <ItemRow key={item.id} item={item} days={days} />
            ))}
          </ul>
          {items.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              This order has no line items.
            </p>
          )}
        </div>

        <div>
          <div className="rounded-xl border bg-card p-4">
            <h2 className="font-heading text-sm font-semibold">
              Rental period
            </h2>
            <p className="mt-3 inline-flex items-center gap-2 text-sm">
              <CalendarDays
                className="size-4 text-muted-foreground"
                aria-hidden
              />
              {formatDate(order.startDate)} → {formatDate(order.endDate)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {days} {days === 1 ? "day" : "days"}
            </p>

            <Separator className="my-4" />

            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-heading text-lg font-semibold">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          <PaymentPanel order={order} />
        </div>
      </div>
    </>
  )
}

function ItemRow({ item, days }: { item: OrderItem; days: number }) {
  const gear = item.gearItem
  const lineTotal = Number(item.pricePerDay) * item.quantity * days

  return (
    <li className="flex items-center gap-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
        {gear?.imageUrl ? (
          <Image
            src={gear.imageUrl}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Backpack
              className="size-5 text-muted-foreground"
              strokeWidth={1.25}
              aria-hidden
            />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {gear ? (
          <Link
            href={`/gear/${gear.id}`}
            className="truncate text-sm font-medium transition-colors hover:text-primary"
          >
            {gear.name}
          </Link>
        ) : (
          <p className="truncate text-sm font-medium">Gear item</p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatPrice(item.pricePerDay)} / day × {item.quantity} × {days}{" "}
          {days === 1 ? "day" : "days"}
        </p>
      </div>

      <span className="text-sm tabular-nums">{formatPrice(lineTotal)}</span>
    </li>
  )
}

function PaymentPanel({ order }: { order: RentalOrder }) {
  const payments = order.payments ?? []
  const paid = payments.some((payment) => payment.status === "COMPLETED")
  const pending = payments.some((payment) => payment.status === "PENDING")

  if (order.status === "CANCELLED") {
    return (
      <Notice>This order was cancelled and the gear returned to stock.</Notice>
    )
  }

  if (order.status === "RETURNED") {
    return (
      <Notice>This rental is complete. Thanks for bringing it back.</Notice>
    )
  }

  if (paid || order.status === "PAID" || order.status === "PICKED_UP") {
    return (
      <Notice>
        Payment received. The provider will arrange pickup with you.
      </Notice>
    )
  }

  if (order.status === "PLACED") {
    return (
      <Notice>
        Waiting for the provider to confirm your booking. You&apos;ll be able to
        pay as soon as they do.
      </Notice>
    )
  }

  return (
    <div className="mt-6 rounded-xl border bg-card p-4">
      <h2 className="font-heading text-sm font-semibold">Payment</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {pending
          ? "You have a checkout session open for this order."
          : "The provider confirmed your booking — pay to lock it in."}
      </p>
      <PayButton
        orderId={order.id}
        amount={order.totalAmount}
        resume={pending}
      />
      <p className="mt-2 text-center text-xs text-muted-foreground">
        You&apos;ll be taken to Stripe to pay securely.
      </p>
    </div>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
      {children}
    </p>
  )
}
