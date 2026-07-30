import type { Metadata } from "next"

import { ComingSoon, PageHeader } from "@/app/(dashboard)/_components/PageHeader"

export const metadata: Metadata = { title: "Users · GearUp" }

export default function Page() {
  return (
    <>
      <PageHeader title="Users" description="Everyone on the platform." />
      <ComingSoon what="User management" />
    </>
  )
}
