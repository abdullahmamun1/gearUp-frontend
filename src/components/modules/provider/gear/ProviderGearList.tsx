"use client"

import { useTranslations } from "@/i18n/translations"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { GearCell } from "@/components/shared/GearCell"
import { Pagination } from "@/components/shared/Pagination"
import { TableCell, TableRow } from "@/components/ui/table"
import { useFormat } from "@/i18n/useFormat"
import {
  buildProviderGearHref,
  hasActiveProviderGearFilters,
  type ProviderGearFilters,
} from "@/utils/filters/providerGear"
import { useProviderGear } from "@/hooks/queries/providerGear"
import type { Category, GearItem, Paginated } from "@/types"

import { AvailabilityToggle } from "./AvailabilityToggle"
import { DeleteGearDialog } from "./DeleteGearDialog"
import { GearFormDialog } from "./GearFormDialog"

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
  const t = useTranslations("provider.list")
  const format = useFormat()

  const headings = [
    t("headings.item"),
    t("headings.category"),
    { label: t("headings.pricePerDay"), align: "right" },
    { label: t("headings.stock"), align: "right" },
    t("headings.status"),
    t("headings.added"),
    { label: t("headings.actions"), align: "right" },
  ] as const

  if (error) {
    return <EmptyState>{error.message || t("loadFailed")}</EmptyState>
  }

  const gear = data?.data ?? []
  const meta = data?.meta

  if (gear.length === 0) {
    return (
      <EmptyState>
        {hasActiveProviderGearFilters(filters) ? t("noMatch") : t("none")}
      </EmptyState>
    )
  }

  return (
    <>
      <DataTable
        headings={headings}
        count={{
          total: meta?.total ?? gear.length,
          one: t("countOne"),
          many: t("countMany"),
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
              {format.price(item.pricePerDay)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {format.number(item.stock)}
            </TableCell>
            <TableCell>
              <AvailabilityToggle gear={item} filters={filters} />
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {item.createdAt ? format.date(item.createdAt) : "—"}
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
        label={t("pagination")}
      />
    </>
  )
}
