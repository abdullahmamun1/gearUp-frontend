import type { Metadata } from "next"

import { ComingSoon, PageHeader } from "@/app/(dashboard)/_components/PageHeader"

export const metadata: Metadata = { title: "Gear · GearUp" }

export default function Page() {
  return (
    <>
      <PageHeader title="Gear" description="Every listing, across all providers." />
      <ComingSoon what="Gear moderation" />
    </>
  )
}
