import type { Metadata } from "next"

import { ComingSoon, PageHeader } from "@/app/(dashboard)/_components/PageHeader"

export const metadata: Metadata = { title: "My rentals · GearUp" }

export default function Page() {
  return (
    <>
      <PageHeader title="My rentals" description="Every booking you've made, with its current status." />
      <ComingSoon what="The rentals table" />
    </>
  )
}
