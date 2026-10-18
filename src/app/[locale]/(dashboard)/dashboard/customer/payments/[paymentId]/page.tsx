import type { Metadata } from "next"
import type { AppLocale } from "@/i18n/routing"
import { getTranslations } from "@/i18n/getTranslations"
import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays } from "lucide-react"

import { getPaymentById } from "@/api/payments"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { Separator } from "@/components/ui/separator"
import { getDashboardFormat } from "@/i18n/getFormat"

type Props = { params: Promise<{ locale: string; paymentId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "dashboard.meta",
  })
  return { title: t("receipt") }
}

export default async function PaymentReceiptPage({ params }: Props) {
  const { paymentId } = await params
  const [res, t, format] = await Promise.all([
    getPaymentById(paymentId),
    getTranslations("dashboard.customer.receipt"),
    getDashboardFormat(),
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

  const payment = res.data
  const order = payment.rentalOrder
  const orderId = order?.id ?? payment.rentalOrderId
  const items = order?.items ?? []

  return (
    <>
      <Link
        href="/dashboard/customer/payments"
        transitionTypes={["nav-back"]}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        {t("allPayments")}
      </Link>

      <PageHeader
        title={t("title", { id: payment.id.slice(0, 8) })}
        description={t("started", { date: format.date(payment.createdAt) })}
        action={<PaymentStatusBadge status={payment.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border bg-card p-4 shadow-xs">
          <h2 className="font-heading text-sm font-semibold">{t("details")}</h2>
          <dl className="mt-3 grid gap-3">
            <Row label={t("gateway")} value={payment.gateway} />
            <Row
              label={t("transaction")}
              value={
                <span className="font-mono text-xs break-all">
                  {payment.transactionId}
                </span>
              }
            />
            <Row
              label={t("paidOn")}
              value={payment.paidAt ? format.date(payment.paidAt) : t("notYet")}
            />
          </dl>

          <Separator className="my-4" />

          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted-foreground">{t("amount")}</span>
            <span className="font-heading text-lg font-semibold">
              {format.price(payment.amount)}
            </span>
          </div>

          {Number(payment.refundedAmount ?? 0) > 0 && (
            <div className="mt-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {t("refunded")}
                {payment.refundedAt && ` · ${format.date(payment.refundedAt)}`}
              </span>
              <span className="tabular-nums">
                − {format.price(payment.refundedAmount!)}
              </span>
            </div>
          )}

          {payment.status === "PENDING" && (
            <p className="mt-4 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
              {t("sessionOpen")}
            </p>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-xs">
          <h2 className="font-heading text-sm font-semibold">
            {t("rentalOrder")}
          </h2>

          <div className="mt-3 flex flex-col items-start gap-3">
            {orderId ? (
              <Link
                href={`/dashboard/customer/orders/${orderId}`}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {t("order", { id: orderId.slice(0, 8) })}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">{t("notLinked")}</p>
            )}

            {order && (
              <>
                {items.length > 0 && (
                  <ul className="grid gap-1 text-sm">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-baseline gap-2">
                        <span>{item.gearItem?.name ?? t("gearItem")}</span>
                        <span className="text-xs text-muted-foreground">
                          × {format.number(item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="flex items-center gap-2 text-sm">
                  <CalendarDays
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  {format.date(order.startDate)} → {format.date(order.endDate)}
                </p>
                <RentalStatusBadge status={order.status} />
              </>
            )}
          </div>

          {order && (
            <>
              <Separator className="my-4" />
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  {t("orderTotal")}
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {format.price(order.totalAmount)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium">{value}</dd>
    </div>
  )
}
