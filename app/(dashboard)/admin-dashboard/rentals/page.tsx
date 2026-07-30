import type { Metadata } from "next"

import { ComingSoon, PageHeader } from "@/app/(dashboard)/_components/PageHeader"

export const metadata: Metadata = { title: "Rentals · GearUp" }

export default function Page() {
  return (
    <>
      <PageHeader title="Rentals" description="Every rental order on the platform." />
      <ComingSoon what="The rentals table" />
    </>
  )
}
