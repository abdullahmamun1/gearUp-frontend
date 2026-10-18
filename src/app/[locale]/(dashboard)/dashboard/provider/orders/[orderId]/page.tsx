import type { Metadata } from "next"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { initLocale } from "@/i18n/server"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Backpack,
  CalendarDays,
  Mail,
  UserRound,
} from "lucide-react"
import { getTranslations } from "@/i18n/getTranslations"

import { getRentalById } from "@/api/rentals"
import { OrderLiveRefresh } from "@/components/modules/customer/orders/OrderLiveRefresh"
import { OrderChat } from "@/components/modules/orders/OrderChat"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { OrderActions } from "@/components/modules/provider/orders/ProviderOrdersList"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { getDashboardFormat } from "@/i18n/getFormat"
import { PROVIDER_ORDERS_PATH } from "@/utils/filters/dashboard"
import { rentalDays } from "@/utils/rental"

type Props = { params: Promise<{ locale: string; orderId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: "provider.meta" })
  return { title: t("order") }
}

/** One order from the provider's side: who, what, when, next step, chat. */
export default async function ProviderOrderPage({ params }: Props) {
  const { orderId } = await params
  const res = await getRentalById(orderId)
  const t = await getTranslations("provider.orderPage")
  const format = await getDashboardFormat()
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

  return (
    <>
      <OrderLiveRefresh
        active={!["RETURNED", "CANCELLED"].includes(order.status)}
      />
      <Link
        href={PROVIDER_ORDERS_PATH}
        transitionTypes={["nav-back"]}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        {t("allOrders")}
      </Link>

      <PageHeader
        title={t("title", { id: order.id.slice(0, 8) })}
        description={t("placed", { date: format.date(order.createdAt) })}
        action={<RentalStatusBadge status={order.status} />}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0">
          <section className="rounded-2xl border bg-card p-5 shadow-xs">
            <h2 className="font-heading text-lg font-semibold">{t("gear")}</h2>
            <ul className="mt-3 grid gap-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {item.gearItem?.imageUrl ? (
                      <Image
                        src={item.gearItem.imageUrl}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <Backpack
                        className="absolute inset-0 m-auto size-5 text-muted-foreground"
                        aria-hidden
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {item.gearItem?.name ?? t("gearItem")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("itemLine", {
                        price: format.price(item.pricePerDay),
                        quantity: format.number(item.quantity),
                        days,
                      })}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <OrderChat
            orderId={order.id}
            otherName={order.customer?.name ?? t("theCustomer")}
          />
        </div>

        <div className="grid gap-6">
          <section className="rounded-2xl border bg-card p-5 shadow-xs">
            <h2 className="font-heading text-lg font-semibold">
              {t("nextStep")}
            </h2>
            <div className="mt-3 flex justify-start [&>*]:text-left">
              <OrderActions order={order} />
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-xs">
            <h2 className="font-heading text-lg font-semibold">
              {t("details")}
            </h2>
            <dl className="mt-3 grid gap-2.5 text-sm">
              <Row icon={UserRound} label={t("customer")}>
                {order.customer?.name ?? "—"}
              </Row>
              {order.customer?.email && (
                <Row icon={Mail} label={t("email")}>
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="text-primary hover:underline"
                  >
                    {order.customer.email}
                  </a>
                </Row>
              )}
              <Row icon={CalendarDays} label={t("dates")}>
                {format.date(order.startDate)} → {format.date(order.endDate)}
              </Row>
            </dl>
            <dl className="mt-4 grid gap-1.5 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("rental")}</dt>
                <dd className="tabular-nums">
                  {format.price(order.totalAmount)}
                </dd>
              </div>
              {deposit > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("deposit")}</dt>
                  <dd className="tabular-nums">{format.price(deposit)}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </>
  )
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd className="min-w-0 text-right font-medium break-all">{children}</dd>
    </div>
  )
}
