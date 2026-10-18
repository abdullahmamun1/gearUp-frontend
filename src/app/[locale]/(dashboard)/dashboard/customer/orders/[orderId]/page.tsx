import type { Metadata } from "next"
import type { AppLocale } from "@/i18n/routing"
import { getTranslations } from "@/i18n/getTranslations"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
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
import { getDashboardFormat } from "@/i18n/getFormat"
import {
  canCancel,
  freeCancellationUntil,
  isFreeCancellationOpen,
  rentalDays,
} from "@/utils/rental"
import { cn } from "@/lib/utils"
import type { OrderItem, RentalOrder } from "@/types"
import { CancelOrderButton } from "@/components/modules/customer/orders/CancelOrderButton"
import { OrderLiveRefresh } from "@/components/modules/customer/orders/OrderLiveRefresh"
import { OrderChat } from "@/components/modules/orders/OrderChat"
import { PickupPanel } from "@/components/modules/orders/PickupPanel"
import { PayButton } from "@/components/modules/customer/orders/PayButton"
import { ReviewDialog } from "@/components/modules/customer/orders/ReviewDialog"

type Props = {
  params: Promise<{ locale: string; orderId: string }>
  searchParams: Promise<{ placed?: string; paid?: string; cancelled?: string }>
}

export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "dashboard.meta",
  })
  return { title: t("order") }
}

async function orderTools() {
  const [t, tc, format] = await Promise.all([
    getTranslations("dashboard.customer.order"),
    getTranslations("common"),
    getDashboardFormat(),
  ])
  return { t, tc, format }
}

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { orderId } = await params
  const { placed, paid, cancelled } = await searchParams
  const [res, { t, tc, format }] = await Promise.all([
    getRentalById(orderId),
    orderTools(),
  ])

  if (!res.success && (res.statusCode === 404 || res.statusCode === 403)) {
    notFound()
  }

  if (!res.success || !res.data) {
    return (
      <p className="text-sm text-muted-foreground">
        {res.message || t("loadFailed")}
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
        {t("allRentals")}
      </Link>

      {paid === "1" && (
        <p className="mb-6 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden
          />
          <span>
            <span className="font-medium">{t("paymentReceived")}</span>{" "}
            {order.status === "PAID"
              ? t("paidConfirmed")
              : t("stripeConfirming")}
          </span>
        </p>
      )}

      {cancelled === "1" && order.status !== "PAID" && (
        <p className="mb-6 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
          {t("checkoutCancelled")}
        </p>
      )}

      {placed === "1" && order.status === "PLACED" && (
        <p className="mb-6 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden
          />
          <span>
            <span className="font-medium">{t("requestIn")}</span>{" "}
            {t("requestInBody")}
          </span>
        </p>
      )}

      <PageHeader
        title={t("title", { id: order.id.slice(0, 8) })}
        description={t("placed", { date: format.date(order.createdAt) })}
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
        <div className="min-w-0">
          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <h2 className="font-heading text-sm font-semibold">{t("gear")}</h2>
            <ul className="mt-3 grid gap-3">
              {items.map((item) => (
                <ItemRow key={item.id} item={item} days={days} />
              ))}
            </ul>
            {items.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("noItems")}
              </p>
            )}
          </div>

          {order.pickup && order.status !== "CANCELLED" && (
            <PickupPanel pickup={order.pickup} />
          )}
          <OrderChat
            orderId={order.id}
            otherName={order.provider?.name ?? t("theProvider")}
          />
        </div>

        <div>
          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <h2 className="font-heading text-sm font-semibold">
              {t("period")}
            </h2>
            <p className="mt-3 inline-flex items-center gap-2 text-sm">
              <CalendarDays
                className="size-4 text-muted-foreground"
                aria-hidden
              />
              {format.date(order.startDate)} → {format.date(order.endDate)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tc("units.days", { count: days })}
            </p>

            <Separator className="my-4" />

            <dl className="grid gap-1.5 text-sm">
              <Line
                label={t("rental")}
                value={format.price(order.totalAmount)}
              />
              {deposit > 0 && (
                <Line
                  label={t("deposit")}
                  value={format.price(deposit)}
                  hint={tc(`depositStatus.${order.depositStatus}`)}
                />
              )}
              {refunded > 0 && (
                <Line
                  label={t("refundedToCard")}
                  value={`− ${format.price(refunded)}`}
                  hint={
                    completed?.refundedAt
                      ? format.date(completed.refundedAt)
                      : undefined
                  }
                />
              )}
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <dt className="text-sm text-muted-foreground">
                  {completed ? t("youPaid") : t("total")}
                </dt>
                <dd className="font-heading text-lg font-semibold">
                  {format.price(
                    completed
                      ? Number(completed.amount) - refunded
                      : Number(order.totalAmount) + deposit
                  )}
                </dd>
              </div>
            </dl>

            {order.depositStatus === "CLAIMED" && (
              <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                {order.damageClaimAmount
                  ? t("damageReportedClaimed", {
                      amount: format.price(order.damageClaimAmount),
                    })
                  : t("damageReported")}
                {order.damageNote && `: “${order.damageNote}”`}
                {t("damageReview")}
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

async function ItemRow({ item, days }: { item: OrderItem; days: number }) {
  const { t, format } = await orderTools()
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
          <p className="truncate text-sm font-medium">{t("gearItem")}</p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("itemLine", {
            price: format.price(item.pricePerDay),
            quantity: format.number(item.quantity),
            days,
          })}
        </p>
      </div>

      <span className="text-sm tabular-nums">{format.price(lineTotal)}</span>
    </li>
  )
}

async function PaymentPanel({ order }: { order: RentalOrder }) {
  const { t, tc, format } = await orderTools()
  const providerName = order.provider?.name ?? t("theProvider")
  const payments = order.payments ?? []
  const paid = payments.some((payment) => payment.status === "COMPLETED")
  const pending = payments.some((payment) => payment.status === "PENDING")

  if (order.status === "CANCELLED") {
    return (
      <Notice>
        {order.cancelReason
          ? tc(`cancelReason.${order.cancelReason}`)
          : t("cancelledFallback")}
        {order.cancelNote ? `: “${order.cancelNote}”` : t("fullStop")}
        {paid && t("refundedAny")}
      </Notice>
    )
  }

  if (order.status === "RETURNED") {
    return <Notice>{t("returnedNotice")}</Notice>
  }

  if (order.status === "PAID") {
    const freeUntil = freeCancellationUntil(order.startDate)
    return (
      <Notice>
        {t("paidNotice")}{" "}
        {isFreeCancellationOpen(order.startDate)
          ? t("freeCancelUntil", { date: format.dateTime(freeUntil) })
          : t("freeCancelPassed")}
      </Notice>
    )
  }

  if (order.status === "PICKED_UP") {
    return (
      <Notice>
        {t(
          Number(order.depositAmount ?? 0) > 0
            ? "pickedUpNoticeDeposit"
            : "pickedUpNotice",
          { name: providerName, date: format.date(order.endDate) }
        )}
      </Notice>
    )
  }

  if (paid) {
    return <Notice>{t("paidNotice")}</Notice>
  }

  if (order.status === "PLACED") {
    return (
      <Notice>
        {order.respondBy
          ? t("placedNoticeDeadline", {
              name: providerName,
              date: format.dateTime(order.respondBy),
            })
          : t("placedNotice", { name: providerName })}
      </Notice>
    )
  }

  return (
    <div className="mt-6 rounded-2xl border bg-card p-4 shadow-xs">
      <h2 className="font-heading text-sm font-semibold">{t("payment")}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {pending ? t("sessionOpen") : t("confirmedPay")}
        {order.paymentDueAt && (
          <>
            {" "}
            <span className="font-medium text-foreground">
              {t("payBy", { date: format.dateTime(order.paymentDueAt) })}
            </span>{" "}
            {t("orReleased")}
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
        {t("stripeNote")}
      </p>
    </div>
  )
}

async function ReviewPanel({
  order,
  items,
}: {
  order: RentalOrder
  items: OrderItem[]
}) {
  if (order.status !== "RETURNED") return null
  const { t, format } = await orderTools()

  const reviewable = items.filter((item) => item.gearItem)

  return (
    <div className="mt-6 rounded-2xl border bg-card p-4 shadow-xs">
      <h2 className="font-heading text-sm font-semibold">{t("yourReview")}</h2>

      {order.review ? (
        <>
          <div className="mt-3 flex items-center gap-2">
            <Stars rating={order.review.rating} />
            <span className="text-sm text-muted-foreground">
              {t("ratingOutOf", { rating: format.number(order.review.rating) })}
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
          {t("noGearLeft")}
        </p>
      ) : (
        <>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("howDidItGo")}
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
  { status: "PLACED" },
  { status: "CONFIRMED" },
  { status: "PAID" },
  { status: "PICKED_UP" },
  { status: "RETURNED" },
] as const

type Step = (typeof TIMELINE)[number]["status"]

/** What the customer is waiting for at the current (first unreached) step. */
async function waitingFor(order: RentalOrder, step: Step) {
  const [t, format] = await Promise.all([
    getTranslations("dashboard.customer.timeline"),
    getDashboardFormat(),
  ])
  switch (step) {
    case "CONFIRMED":
      return order.respondBy
        ? t("waitingForProviderBy", {
            date: format.dateTime(order.respondBy),
          })
        : t("waitingForProvider")
    case "PAID":
      return order.paymentDueAt
        ? t("yourTurnBy", { date: format.dateTime(order.paymentDueAt) })
        : t("yourTurn")
    case "PICKED_UP":
      return t("pickUpOn", { date: format.date(order.startDate) })
    case "RETURNED":
      return t("bringBackOn", { date: format.date(order.endDate) })
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
async function OrderTimeline({ order }: { order: RentalOrder }) {
  const [t, tc, format] = await Promise.all([
    getTranslations("dashboard.customer.timeline"),
    getTranslations("common"),
    getDashboardFormat(),
  ])
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
  const currentStep = TIMELINE[current]?.status
  const waiting = currentStep ? await waitingFor(order, currentStep) : undefined

  return (
    <div className="mt-6 rounded-2xl border bg-card p-5 shadow-xs">
      <h2 className="font-heading font-semibold">{t("title")}</h2>
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
                  {t(`step.${step.status}`)}
                  <span className="sr-only">
                    {done ? t("done") : isCurrent ? t("current") : ""}
                  </span>
                </span>
                {done && at[step.status] && (
                  <span className="block text-xs text-muted-foreground">
                    {format.dateTime(at[step.status]!)}
                  </span>
                )}
                {isCurrent && (
                  <span className="mt-0.5 block text-sm text-ember-strong">
                    {waiting}
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
                  ? tc(`cancelReason.${order.cancelReason}`)
                  : tc("rentalStatusShort.CANCELLED")}
              </span>
              {order.cancelledAt && (
                <span className="block text-xs text-muted-foreground">
                  {format.dateTime(order.cancelledAt)}
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
