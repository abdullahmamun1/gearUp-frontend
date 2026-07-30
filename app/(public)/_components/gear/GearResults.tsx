import { getGearList } from "@/app/(public)/_actions/getGear"
import { GearCard } from "@/components/shared/GearCard"
import { hasActiveFilters, toGearQuery, type GearFilters } from "@/lib/gearQuery"

import { GearPagination } from "./GearPagination"

export async function GearResults({ filters }: { filters: GearFilters }) {
  const res = await getGearList(toGearQuery(filters))

  if (!res.success) {
    return (
      <Message>{res.message || "Couldn't load gear. Please try again."}</Message>
    )
  }

  const items = res.data?.data ?? []
  const meta = res.data?.meta
  const total = meta?.total ?? items.length

  if (items.length === 0) {
    return (
      <Message>
        {hasActiveFilters(filters)
          ? "No gear matches those filters. Try widening your price range or clearing a filter."
          : "No gear listed yet. Check back soon — providers are adding kit all the time."}
      </Message>
    )
  }

  return (
    <>
      <p className="mt-6 text-sm text-muted-foreground">
        {total} {total === 1 ? "item" : "items"} available
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((gear) => (
          <GearCard key={gear.id} gear={gear} />
        ))}
      </div>

      <GearPagination filters={filters} totalPages={meta?.totalPages ?? 1} />
    </>
  )
}

function Message({ children }: { children: React.ReactNode }) {
  return <p className="mt-10 text-sm text-muted-foreground">{children}</p>
}
