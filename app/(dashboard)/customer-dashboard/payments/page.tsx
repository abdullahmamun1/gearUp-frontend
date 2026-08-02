import type { Metadata } from "next"
import Link from "next/link"

import { getMyPayments } from "@/app/(dashboard)/_actions/getMyPayments"
import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { MyPaymentsList } from "./_components/MyPaymentsList"

export const metadata: Metadata = { title: "Payments · GearUp" }

export default async function CustomerPaymentsPage() {
  const res = await getMyPayments()

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

      {!res.success || !res.data ? (
        <EmptyState>
          {res.message || "Couldn't load your payments. Please try again."}
        </EmptyState>
      ) : (
        <MyPaymentsList initialData={res.data} />
      )}
    </>
  )
}
