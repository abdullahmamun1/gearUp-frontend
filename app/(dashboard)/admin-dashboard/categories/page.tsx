import type { Metadata } from "next"

import { ComingSoon, PageHeader } from "@/app/(dashboard)/_components/PageHeader"

export const metadata: Metadata = { title: "Categories · GearUp" }

export default function Page() {
  return (
    <>
      <PageHeader title="Categories" description="The categories providers can list gear under." />
      <ComingSoon what="Category management" />
    </>
  )
}
