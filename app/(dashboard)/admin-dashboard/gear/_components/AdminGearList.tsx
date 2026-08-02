"use client"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { GearCell } from "@/components/shared/GearCell"
import { Pagination } from "@/components/shared/Pagination"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { ADMIN_GEAR_PATH, type AdminGearFilters } from "@/lib/adminQuery"
import { formatPrice } from "@/lib/format"
import { AVAILABILITY_LABEL, gearAvailability } from "@/lib/gearAvailability"
import { useAdminGear } from "@/lib/queries/adminTables"
import { buildHref } from "@/lib/searchParams"
import type { GearItem, Paginated } from "@/types"

const HEADINGS = [
  "Item",
  "Category",
  "Provider",
  { label: "Price / day", align: "right" },
  { label: "Stock", align: "right" },
  "Status",
] as const

export function AdminGearList({
  filters,
  initialData,
}: {
  filters: AdminGearFilters
  initialData: Paginated<GearItem>
}) {
  const { data, error, isFetching } = useAdminGear(filters, initialData)

  if (error) {
    return <EmptyState>{error.message || "Couldn't load listings."}</EmptyState>
  }

  const gear = data?.data ?? []
  const meta = data?.meta

  if (gear.length === 0) {
    return <EmptyState>No gear has been listed yet.</EmptyState>
  }

  return (
    <>
      <DataTable
        headings={HEADINGS}
        count={{
          total: meta?.total ?? gear.length,
          one: "listing",
          many: "listings",
        }}
        isFetching={isFetching}
      >
        {gear.map((item) => (
          <TableRow key={item.id} className="hover:bg-transparent">
            <TableCell>
              <GearCell item={item} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {item.category?.name ?? "—"}
            </TableCell>
            <TableCell>
              {item.provider?.name ?? "—"}
              {item.provider?.email && (
                <p className="text-xs text-muted-foreground">
                  {item.provider.email}
                </p>
              )}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatPrice(item.pricePerDay)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {item.stock}
            </TableCell>
            <TableCell>
              <ListingStatus item={item} />
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) => buildHref(ADMIN_GEAR_PATH, { page })}
        label="Gear pagination"
      />
    </>
  )
}

function ListingStatus({ item }: { item: GearItem }) {
  const status = gearAvailability(item)
  const label = AVAILABILITY_LABEL[status]

  if (status === "unavailable")
    return <Badge variant="secondary">{label}</Badge>
  if (status === "out-of-stock") return <Badge variant="outline">{label}</Badge>
  return (
    <Badge variant="outline" className="border-success/40 text-success">
      {label}
    </Badge>
  )
}
