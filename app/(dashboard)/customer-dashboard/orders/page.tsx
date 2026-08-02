import type { Metadata } from "next"
import Link from "next/link"

import { getMyRentals } from "@/app/(dashboard)/_actions/getMyRentals"
import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { MyRentalsList } from "./_components/MyRentalsList"

export const metadata: Metadata = { title: "My rentals · GearUp" }

export default async function CustomerOrdersPage() {
  const res = await getMyRentals()

  return (
    <>
      <PageHeader
        title="My rentals"
        description="Every booking you've made, with its current status."
        action={
          <Link href="/gear" className={cn(buttonVariants({ size: "lg" }))}>
            Browse gear
          </Link>
        }
      />

      {!res.success || !res.data ? (
        <EmptyState>
          {res.message || "Couldn't load your rentals. Please try again."}
        </EmptyState>
      ) : (
        <MyRentalsList initialData={res.data} />
      )}
    </>
  )
}
