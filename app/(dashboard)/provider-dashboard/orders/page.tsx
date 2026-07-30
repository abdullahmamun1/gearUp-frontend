import type { Metadata } from "next"

import { getProviderOrders } from "@/app/(dashboard)/_actions/getProviderOrders"
import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatPrice } from "@/lib/format"
import { PROVIDER_NEXT_STATUS } from "@/lib/rental"
import { OrderStatusButton } from "./_components/OrderStatusButton"

export const metadata: Metadata = { title: "Orders · GearUp" }

export default async function ProviderOrdersPage() {
  const res = await getProviderOrders()
  const orders = res.data?.data ?? []

  return (
    <>
      <PageHeader
        title="Orders"
        description="Bookings against your gear. Confirm one to let the customer pay."
      />

      {!res.success ? (
        <p className="text-sm text-muted-foreground">
          {res.message || "Couldn't load your orders. Please try again."}
        </p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No one has booked your gear yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Gear</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const items = order.items ?? []
                const first = items[0]?.gearItem?.name ?? "—"
                const extra = items.length - 1
                const action = PROVIDER_NEXT_STATUS[order.status]

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className="font-medium">{order.id.slice(0, 8)}</span>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell>
                      {order.customer?.name ?? "—"}
                      <p className="text-xs text-muted-foreground">
                        {order.customer?.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      {first}
                      {extra > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          +{extra} more
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(order.startDate)} →{" "}
                      {formatDate(order.endDate)}
                    </TableCell>
                    <TableCell>
                      <RentalStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {action ? (
                        <OrderStatusButton
                          orderId={order.id}
                          next={action.next}
                          label={action.label}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {order.status === "CONFIRMED"
                            ? "Awaiting payment"
                            : "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
