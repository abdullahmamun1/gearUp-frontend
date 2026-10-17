import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Backpack,
  CalendarDays,
  Check,
  CheckCircle2,
  X,
} from "lucide-react"

import { getRentalById } from "@/api/rentals"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { Stars } from "@/components/shared/Stars"
import { Separator } from "@/components/ui/separator"
import { formatDate, formatDateTime, formatPrice } from "@/utils/format"
import {
  CANCEL_REASON_LABEL,
  canCancel,
  DEPOSIT_STATUS_LABEL,
  freeCancellationUntil,
  isFreeCancellationOpen,
  rentalDays,
} from "@/utils/rental"
import { cn } from "@/lib/utils"
import type { OrderItem, RentalOrder } from "@/types"
import { CancelOrderButton } from "@/components/modules/customer/orders/CancelOrderButton"
import { OrderLiveRefresh } from "@/components/modules/customer/orders/OrderLiveRefresh"
import { PayButton } from "@/components/modules/customer/orders/PayButton"
import { ReviewDialog } from "@/components/modules/customer/orders/ReviewDialog"

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
  const deposit = Number(order.depositAmount ?? 0)
  const completed = order.payments?.find(
    (payment) => payment.status === "COMPLETED"
  )
  const refunded = Number(completed?.refundedAmount ?? 0)

  // Just back from Stripe and the webhook hasn't landed yet: check often.
  const awaitingWebhook = paid === "1" && order.status === "CONFIRMED"

  return (
    <>
      <OrderLiveRefresh
        active={!["RETURNED", "CANCELLED"].includes(order.status)}
        intervalMs={awaitingWebhook ? 3_000 : 15_000}
      />
      <Link
        href="/dashboard/customer/orders"
        transitionTypes={["nav-back"]}
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
            <span className="font-medium">Your request is in.</span> The
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
            {canCancel(order) && (
              <CancelOrderButton
                orderId={order.id}
                refundAmount={
                  order.status === "PAID" && completed
                    ? Number(completed.amount) - refunded
                    : 0
                }
              />
            )}
          </div>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border bg-card p-4 shadow-xs">
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
          <div className="rounded-xl border bg-card p-4 shadow-xs">
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

            <dl className="grid gap-1.5 text-sm">
              <Line label="Rental" value={formatPrice(order.totalAmount)} />
              {deposit > 0 && (
                <Line
                  label="Refundable deposit"
                  value={formatPrice(deposit)}
                  hint={DEPOSIT_STATUS_LABEL[order.depositStatus]}
                />
              )}
              {refunded > 0 && (
                <Line
                  label="Refunded to your card"
                  value={`− ${formatPrice(refunded)}`}
                  hint={
                    completed?.refundedAt
                      ? formatDate(completed.refundedAt)
                      : undefined
                  }
                />
              )}
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <dt className="text-sm text-muted-foreground">
                  {completed ? "You paid" : "Total"}
                </dt>
                <dd className="font-heading text-lg font-semibold">
                  {formatPrice(
                    completed
                      ? Number(completed.amount) - refunded
                      : Number(order.totalAmount) + deposit
                  )}
                </dd>
              </div>
            </dl>

            {order.depositStatus === "CLAIMED" && (
              <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                The provider reported damage
                {order.damageClaimAmount &&
                  ` and claimed ${formatPrice(order.damageClaimAmount)}`}
                {order.damageNote && `: “${order.damageNote}”`}. GearUp reviews
                every claim before any of your deposit is kept.
              </p>
            )}
          </div>

          <OrderTimeline order={order} />
          <PaymentPanel order={order} />
          <ReviewPanel order={order} items={items} />
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
      <Notice>
        {order.cancelReason
          ? CANCEL_REASON_LABEL[order.cancelReason]
          : "This order was cancelled"}
        {order.cancelNote ? `: “${order.cancelNote}”` : "."}
        {paid && " Any payment has been refunded to your card."}
      </Notice>
    )
  }

  if (order.status === "RETURNED") {
    return (
      <Notice>This rental is complete. Thanks for bringing it back.</Notice>
    )
  }

  if (order.status === "PAID") {
    const freeUntil = freeCancellationUntil(order.startDate)
    return (
      <Notice>
        Payment received. The provider will arrange pickup with you.{" "}
        {isFreeCancellationOpen(order.startDate)
          ? `You can cancel for a full refund until ${formatDateTime(freeUntil.toISOString())}.`
          : "The free cancellation window has passed."}
      </Notice>
    )
  }

  if (order.status === "PICKED_UP") {
    return (
      <Notice>
        Enjoy your trip! Bring the gear back to{" "}
        {order.provider?.name ?? "the provider"} on {formatDate(order.endDate)}
        {Number(order.depositAmount ?? 0) > 0 &&
          " — your deposit is refunded once they check it in"}
        .
      </Notice>
    )
  }

  if (paid) {
    return (
      <Notice>
        Payment received. The provider will arrange pickup with you.
      </Notice>
    )
  }

  if (order.status === "PLACED") {
    return (
      <Notice>
        Waiting for {order.provider?.name ?? "the provider"} to confirm your
        booking
        {order.respondBy &&
          ` — they have until ${formatDateTime(order.respondBy)}`}
        . You&apos;ll be able to pay as soon as they do.
      </Notice>
    )
  }

  return (
    <div className="mt-6 rounded-xl border bg-card p-4 shadow-xs">
      <h2 className="font-heading text-sm font-semibold">Payment</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {pending
          ? "You have a checkout session open for this order."
          : "The provider confirmed your booking — pay to lock it in."}
        {order.paymentDueAt && (
          <>
            {" "}
            <span className="font-medium text-foreground">
              Pay by {formatDateTime(order.paymentDueAt)}
            </span>{" "}
            or the dates are released.
          </>
        )}
      </p>
      <PayButton
        orderId={order.id}
        amount={String(
          Number(order.totalAmount) + Number(order.depositAmount ?? 0)
        )}
        resume={pending}
      />
      <p className="mt-2 text-center text-xs text-muted-foreground">
        You&apos;ll be taken to Stripe to pay securely.
      </p>
    </div>
  )
}

function ReviewPanel({
  order,
  items,
}: {
  order: RentalOrder
  items: OrderItem[]
}) {
  if (order.status !== "RETURNED") return null

  const reviewable = items.filter((item) => item.gearItem)

  return (
    <div className="mt-6 rounded-xl border bg-card p-4 shadow-xs">
      <h2 className="font-heading text-sm font-semibold">Your review</h2>

      {order.review ? (
        <>
          <div className="mt-3 flex items-center gap-2">
            <Stars rating={order.review.rating} />
            <span className="text-sm text-muted-foreground">
              {order.review.rating} / 5
            </span>
          </div>
          {order.review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
              {order.review.comment}
            </p>
          )}
        </>
      ) : reviewable.length === 0 ? (
        <p className="mt-1.5 text-sm text-muted-foreground">
          This order has no gear left to review.
        </p>
      ) : (
        <>
          <p className="mt-1.5 text-sm text-muted-foreground">
            How did this rental go? Your review appears on the gear page.
          </p>
          <ReviewDialog orderId={order.id} items={reviewable} />
        </>
      )}
    </div>
  )
}

function Line({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">
        {label}
        {hint && <span className="block text-xs">{hint}</span>}
      </dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}

const TIMELINE = [
  { status: "PLACED", label: "Requested" },
  { status: "CONFIRMED", label: "Confirmed by provider" },
  { status: "PAID", label: "Paid" },
  { status: "PICKED_UP", label: "Picked up" },
  { status: "RETURNED", label: "Returned" },
] as const

type Step = (typeof TIMELINE)[number]["status"]

/** What the customer is waiting for at the current (first unreached) step. */
function waitingFor(order: RentalOrder, step: Step) {
  switch (step) {
    case "CONFIRMED":
      return order.respondBy
        ? `Waiting for the provider — they answer by ${formatDateTime(order.respondBy)}`
        : "Waiting for the provider to confirm"
    case "PAID":
      return order.paymentDueAt
        ? `Your turn — pay by ${formatDateTime(order.paymentDueAt)}`
        : "Your turn — pay to lock it in"
    case "PICKED_UP":
      return `Pick it up on ${formatDate(order.startDate)}`
    case "RETURNED":
      return `Bring it back on ${formatDate(order.endDate)}`
    default:
      return undefined
  }
}

/**
 * The order's journey. A step counts as done once the order's status has
 * reached it (timestamps are shown when the API has them, but a missing or
 * refunded one never un-ticks a step). Cancelled orders show only the steps
 * they really reached, then the cancellation.
 */
function OrderTimeline({ order }: { order: RentalOrder }) {
  const paidAt = order.payments?.find((payment) => payment.paidAt)?.paidAt
  const at: Record<Step, string | null | undefined> = {
    PLACED: order.createdAt,
    CONFIRMED: order.confirmedAt,
    PAID: paidAt,
    PICKED_UP: order.pickedUpAt,
    RETURNED: order.returnedAt,
  }
  const cancelled = order.status === "CANCELLED"
  const rank = TIMELINE.findIndex((step) => step.status === order.status)
  const reached = (index: number) =>
    cancelled ? Boolean(at[TIMELINE[index]!.status]) : index <= rank
  const steps = cancelled
    ? TIMELINE.filter((_, index) => reached(index))
    : TIMELINE
  const current = cancelled ? -1 : rank + 1

  return (
    <div className="mt-6 rounded-2xl border bg-card p-5 shadow-xs">
      <h2 className="font-heading font-semibold">Progress</h2>
      <ol className="mt-4">
        {steps.map((step) => {
          const index = TIMELINE.indexOf(step)
          const done = reached(index)
          const isCurrent = index === current
          const last = step === steps.at(-1) && !cancelled
          return (
            <li
              key={step.status}
              className="relative flex gap-3 pb-5 last:pb-0"
            >
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-6 bottom-0 left-[11px] w-0.5",
                    done && reached(index + 1) ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              <span
                className={cn(
                  "relative grid size-6 shrink-0 place-items-center rounded-full",
                  done && "bg-primary text-primary-foreground",
                  isCurrent &&
                    "border-2 border-primary bg-card ring-4 ring-primary/15",
                  !done && !isCurrent && "border-2 border-border bg-card"
                )}
              >
                {done ? (
                  <Check className="size-3.5" aria-hidden />
                ) : isCurrent ? (
                  <span className="size-2 rounded-full bg-primary motion-safe:animate-pulse" />
                ) : null}
              </span>
              <span className="min-w-0 pt-0.5">
                <span
                  className={cn(
                    "block text-[15px]",
                    done || isCurrent ? "font-medium" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                  <span className="sr-only">
                    {done ? " (done)" : isCurrent ? " (current step)" : ""}
                  </span>
                </span>
                {done && at[step.status] && (
                  <span className="block text-xs text-muted-foreground">
                    {formatDateTime(at[step.status]!)}
                  </span>
                )}
                {isCurrent && (
                  <span className="mt-0.5 block text-sm text-ember-strong">
                    {waitingFor(order, step.status)}
                  </span>
                )}
              </span>
            </li>
          )
        })}
        {cancelled && (
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-destructive/12 text-destructive">
              <X className="size-3.5" aria-hidden />
            </span>
            <span className="pt-0.5">
              <span className="block text-[15px] font-medium">
                {order.cancelReason
                  ? CANCEL_REASON_LABEL[order.cancelReason]
                  : "Cancelled"}
              </span>
              {order.cancelledAt && (
                <span className="block text-xs text-muted-foreground">
                  {formatDateTime(order.cancelledAt)}
                </span>
              )}
            </span>
          </li>
        )}
      </ol>
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
