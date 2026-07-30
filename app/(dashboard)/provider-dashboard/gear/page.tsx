import type { Metadata } from "next"

import { ComingSoon, PageHeader } from "@/app/(dashboard)/_components/PageHeader"

export const metadata: Metadata = { title: "My gear · GearUp" }

export default function Page() {
  return (
    <>
      <PageHeader title="My gear" description="The listings you rent out." />
      <ComingSoon what="Gear management" />
    </>
  )
}
