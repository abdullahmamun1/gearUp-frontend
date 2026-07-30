import type { Metadata } from "next"
import Link from "next/link"

import { getMyPayments } from "@/app/(dashboard)/_actions/getMyPayments"
import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge"
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

export const metadata: Metadata = { title: "Payments · GearUp" }

export default async function CustomerPaymentsPage() {
  const res = await getMyPayments()
  const payments = res.data?.data ?? []

  return (
    <>
      <PageHeader
        title="Payments"
        description="Receipts for the rentals you've paid for."
        action={
          <Link
            href="/customer-dashboard/orders"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            My rentals
          </Link>
        }
      />

      {!res.success ? (
        <p className="text-sm text-muted-foreground">
          {res.message || "Couldn't load your payments. Please try again."}
        </p>
      ) : payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No payments yet. They appear here once you pay for a confirmed
          booking.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Gear</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid on</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const items = payment.rentalOrder?.items ?? []
                const first = items[0]?.gearItem?.name ?? "—"
                const extra = items.length - 1

                return (
                  <TableRow
                    key={payment.id}
                    className="relative cursor-pointer focus-within:bg-muted/50"
                  >
                    <TableCell>
                      <Link
                        href={`/customer-dashboard/payments/${payment.id}`}
                        className="font-medium after:absolute after:inset-0"
                      >
                        {payment.id.slice(0, 8)}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {payment.rentalOrder?.id.slice(0, 8) ??
                        payment.rentalOrderId?.slice(0, 8) ??
                        "—"}
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
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {payment.paidAt ? formatDate(payment.paidAt) : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(payment.amount)}
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
