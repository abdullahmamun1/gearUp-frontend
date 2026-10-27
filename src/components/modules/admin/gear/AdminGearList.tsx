"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Star } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { setGearFeatured } from "@/api/admin"
import { Switch } from "@/components/ui/switch"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { GearCell } from "@/components/shared/GearCell"
import { Pagination } from "@/components/shared/Pagination"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { ADMIN_GEAR_PATH, type AdminGearFilters } from "@/utils/filters/admin"
import { useFormat } from "@/i18n/useFormat"
import { AVAILABILITY_LABEL, gearAvailability } from "@/utils/gearAvailability"
import { adminGearKeys, useAdminGear } from "@/hooks/queries/adminTables"
import { buildHref } from "@/utils/searchParams"
import type { GearItem, Paginated } from "@/types"

export function AdminGearList({
  filters,
  initialData,
}: {
  filters: AdminGearFilters
  initialData: Paginated<GearItem>
}) {
  const { data, error, isFetching } = useAdminGear(filters, initialData)
  const t = useTranslations("admin.gear")
  const format = useFormat()
  const headings = [
    t("headingItem"),
    t("headingCategory"),
    t("headingProvider"),
    { label: t("headingPrice"), align: "right" },
    { label: t("headingStock"), align: "right" },
    t("headingStatus"),
    t("headingFeatured"),
  ] as const

  if (error) {
    return <EmptyState>{error.message || t("loadError")}</EmptyState>
  }

  const gear = data?.data ?? []
  const meta = data?.meta

  if (gear.length === 0) {
    return <EmptyState>{t("noMatch")}</EmptyState>
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
            <TableCell>
              {item.provider?.name ?? "—"}
              {item.provider?.email && (
                <p
                  className="max-w-44 truncate text-xs text-muted-foreground"
                  title={item.provider.email}
                >
                  {item.provider.email}
                </p>
              )}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {format.price(item.pricePerDay)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {format.number(item.stock)}
            </TableCell>
            <TableCell>
              <ListingStatus item={item} />
            </TableCell>
            <TableCell>
              <FeaturedToggle item={item} filters={filters} />
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) => buildHref(ADMIN_GEAR_PATH, { ...filters, page })}
        label={t("pagination")}
      />
    </>
  )
}

function ListingStatus({ item }: { item: GearItem }) {
  const t = useTranslations("gear")
  const status = gearAvailability(item)
  const label = t(AVAILABILITY_LABEL[status])

  if (status === "unavailable")
    return <Badge variant="secondary">{label}</Badge>
  if (status === "out-of-stock") return <Badge variant="outline">{label}</Badge>
  return (
    <Badge variant="outline" className="border-success/40 text-success">
      {label}
    </Badge>
  )
}

/** Featured gear leads the home page and the mega menu. */
function FeaturedToggle({
  item,
  filters,
}: {
  item: GearItem
  filters: AdminGearFilters
}) {
  const queryClient = useQueryClient()
  const queryKey = adminGearKeys.list(filters)
  const featured = Boolean(item.isFeatured)
  const t = useTranslations("admin.gear")

  const { mutate, isPending } = useMutation({
    mutationFn: async (isFeatured: boolean) => {
      const res = await setGearFeatured(item.id, isFeatured)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    onMutate: async (isFeatured) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Paginated<GearItem>>(queryKey)
      queryClient.setQueryData<Paginated<GearItem>>(queryKey, (current) =>
        current
          ? {
              ...current,
              data: current.data.map((row) =>
                row.id === item.id ? { ...row, isFeatured } : row
              ),
            }
          : current
      )
      return { previous }
    },
    onError: (error, _value, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKey, context.previous)
      toast.error(error.message || t("featureFailed"))
    },
    onSuccess: (_data, isFeatured) =>
      toast.success(
        isFeatured
          ? t("featuredOn", { name: item.name })
          : t("featuredOff", { name: item.name })
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={featured}
        onCheckedChange={(next) => mutate(next)}
        disabled={isPending}
        aria-label={
          featured
            ? t("unfeatureAria", { name: item.name })
            : t("featureAria", { name: item.name })
        }
      />
      {featured && (
        <Star
          className="size-4 fill-ember text-ember-strong"
          aria-label={t("featured")}
        />
      )}
    </div>
  )
}
