import { getAdminRentals } from "@/app/(dashboard)/_actions/getAdminTables"
import { Pagination } from "@/components/shared/Pagination"
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ADMIN_RENTALS_PATH,
  buildAdminHref,
  type AdminRentalsFilters,
} from "@/lib/adminQuery"
import { formatDate, formatPrice } from "@/lib/format"

import { AdminMessage } from "../../_components/AdminMessage"

export async function AdminRentalsTable({
  filters,
}: {
  filters: AdminRentalsFilters
}) {
  const res = await getAdminRentals(filters)

  if (!res.success) {
    return (
      <AdminMessage>
        {res.message || "Couldn't load rentals. Please try again."}
      </AdminMessage>
    )
  }

  const orders = res.data?.data ?? []
  const meta = res.data?.meta
  const total = meta?.total ?? orders.length

  if (orders.length === 0) {
    return (
      <AdminMessage>
        {filters.status
          ? "No orders have that status."
          : "No one has booked anything yet."}
      </AdminMessage>
    )
  }

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        {total} {total === 1 ? "order" : "orders"}
      </p>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Gear</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const items = order.items ?? []
              const first = items[0]?.gearItem?.name ?? "—"
              const extra = items.length - 1
              // Latest payment wins: a retried checkout leaves the earlier
              // PENDING row behind it.
              const payment = order.payments?.at(-1)

              return (
                <TableRow key={order.id} className="hover:bg-transparent">
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
                    {formatDate(order.startDate)} → {formatDate(order.endDate)}
                  </TableCell>
                  <TableCell>
                    <RentalStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {payment ? (
                      <PaymentStatusBadge status={payment.status} />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Not started
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(order.totalAmount)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) =>
          buildAdminHref(ADMIN_RENTALS_PATH, { ...filters, page })
        }
        label="Rentals pagination"
      />
    </>
  )
}
