import type { Metadata } from "next"

import { ComingSoon, PageHeader } from "@/app/(dashboard)/_components/PageHeader"

export const metadata: Metadata = { title: "Orders · GearUp" }

export default function Page() {
  return (
    <>
      <PageHeader title="Orders" description="Bookings against your gear, and their status." />
      <ComingSoon what="The provider order table" />
    </>
  )
}
