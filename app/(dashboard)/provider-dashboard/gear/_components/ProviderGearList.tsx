"use client"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { GearCell } from "@/components/shared/GearCell"
import { Pagination } from "@/components/shared/Pagination"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDate, formatPrice } from "@/lib/format"
import {
  buildProviderGearHref,
  hasActiveProviderGearFilters,
  type ProviderGearFilters,
} from "@/lib/providerGearQuery"
import { useProviderGear } from "@/lib/queries/providerGear"
import type { Category, GearItem, Paginated } from "@/types"

import { AvailabilityToggle } from "./AvailabilityToggle"
import { DeleteGearDialog } from "./DeleteGearDialog"
import { GearFormDialog } from "./GearFormDialog"

const HEADINGS = [
  "Item",
  "Category",
  { label: "Price / day", align: "right" },
  { label: "Stock", align: "right" },
  "Status",
  "Added",
  { label: "Actions", align: "right" },
] as const

export function ProviderGearList({
  filters,
  categories,
  initialData,
}: {
  filters: ProviderGearFilters
  categories: Category[]
  initialData: Paginated<GearItem>
}) {
  const { data, error, isFetching } = useProviderGear(filters, initialData)

  if (error) {
    return (
      <EmptyState>{error.message || "Couldn't load your listings."}</EmptyState>
    )
  }

  const gear = data?.data ?? []
  const meta = data?.meta

  if (gear.length === 0) {
    return (
      <EmptyState>
        {hasActiveProviderGearFilters(filters)
          ? "No listings match those filters. Try clearing one."
          : "You haven't listed any gear yet."}
      </EmptyState>
    )
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
            <TableCell className="text-right tabular-nums">
              {formatPrice(item.pricePerDay)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {item.stock}
            </TableCell>
            <TableCell>
              <AvailabilityToggle gear={item} filters={filters} />
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {item.createdAt ? formatDate(item.createdAt) : "—"}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <GearFormDialog categories={categories} gear={item} />
                <DeleteGearDialog gear={item} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) => buildProviderGearHref({ ...filters, page })}
        label="Listings pagination"
      />
    </>
  )
}
