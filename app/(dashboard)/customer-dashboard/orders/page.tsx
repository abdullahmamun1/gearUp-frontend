import type { Metadata } from "next"
import Link from "next/link"

import { getMyRentals } from "@/app/(dashboard)/_actions/getMyRentals"
import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "My rentals · GearUp" }

export default async function CustomerOrdersPage() {
  const res = await getMyRentals()
  const orders = res.data?.data ?? []

  return (
    <>
      <PageHeader
        title="My rentals"
        description="Every booking you've made, with its current status."
        action={
          <Link href="/gear" className={cn(buttonVariants({ size: "lg" }))}>
            Browse gear
          </Link>
        }
      />

      {!res.success ? (
        <p className="text-sm text-muted-foreground">
          {res.message || "Couldn't load your rentals. Please try again."}
        </p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You haven&apos;t rented anything yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Gear</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const items = order.items ?? []
                const first = items[0]?.gearItem?.name ?? "—"
                const extra = items.length - 1

                return (
                  <TableRow
                    key={order.id}
                    className="relative cursor-pointer focus-within:bg-muted/50"
                  >
                    <TableCell>
                      <Link
                        href={`/customer-dashboard/orders/${order.id}`}
                        className="font-medium after:absolute after:inset-0"
                      >
                        {order.id.slice(0, 8)}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
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
