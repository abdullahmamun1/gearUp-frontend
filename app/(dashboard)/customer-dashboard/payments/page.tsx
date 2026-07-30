import type { Metadata } from "next"

import { ComingSoon, PageHeader } from "@/app/(dashboard)/_components/PageHeader"

export const metadata: Metadata = { title: "Payments · GearUp" }

export default function Page() {
  return (
    <>
      <PageHeader title="Payments" description="Receipts for the rentals you've paid for." />
      <ComingSoon what="Payment history" />
    </>
  )
}
