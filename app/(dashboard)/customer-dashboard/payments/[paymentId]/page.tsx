import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays } from "lucide-react"

import { getPaymentById } from "@/app/(dashboard)/_actions/getPaymentById"
import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { Separator } from "@/components/ui/separator"
import { formatDate, formatPrice } from "@/lib/format"

export const metadata: Metadata = { title: "Receipt · GearUp" }

type Props = { params: Promise<{ paymentId: string }> }

export default async function PaymentReceiptPage({ params }: Props) {
  const { paymentId } = await params
  const res = await getPaymentById(paymentId)

  if (!res.success && (res.statusCode === 404 || res.statusCode === 403)) {
    notFound()
  }

  if (!res.success || !res.data) {
    return (
      <p className="text-sm text-muted-foreground">
        {res.message || "Couldn't load this receipt. Please try again."}
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
        href="/customer-dashboard/payments"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        All payments
      </Link>

      <PageHeader
        title={`Receipt ${payment.id.slice(0, 8)}`}
        description={`Started ${formatDate(payment.createdAt)}`}
        action={<PaymentStatusBadge status={payment.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-sm font-semibold">
            Payment details
          </h2>
          <dl className="mt-3 grid gap-3">
            <Row label="Gateway" value={payment.gateway} />
            <Row
              label="Transaction"
              value={
                <span className="font-mono text-xs break-all">
                  {payment.transactionId}
                </span>
              }
            />
            <Row
              label="Paid on"
              value={payment.paidAt ? formatDate(payment.paidAt) : "Not yet"}
            />
          </dl>

          <Separator className="my-4" />

          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-heading text-lg font-semibold">
              {formatPrice(payment.amount)}
            </span>
          </div>

          {payment.status === "PENDING" && (
            <p className="mt-4 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
              This checkout session is still open. Nothing has been charged
              until Stripe confirms it.
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-sm font-semibold">Rental order</h2>

          <div className="mt-3 flex flex-col items-start gap-3">
            {orderId ? (
              <Link
                href={`/customer-dashboard/orders/${orderId}`}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Order {orderId.slice(0, 8)}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">
                This payment isn&apos;t linked to an order.
              </p>
            )}

            {order && (
              <>
                {items.length > 0 && (
                  <ul className="grid gap-1 text-sm">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-baseline gap-2">
                        <span>{item.gearItem?.name ?? "Gear item"}</span>
                        <span className="text-xs text-muted-foreground">
                          × {item.quantity}
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
                  {formatDate(order.startDate)} → {formatDate(order.endDate)}
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
                  Order total
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {formatPrice(order.totalAmount)}
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
