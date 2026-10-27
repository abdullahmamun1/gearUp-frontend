"use client"

import { useTranslations } from "@/i18n/translations"

import { Link } from "@/i18n/navigation"
import { useFormat } from "@/i18n/useFormat"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  ADMIN_CATEGORIES_PATH,
  ADMIN_PAGE_SIZE,
  type AdminCategoriesFilters,
} from "@/utils/filters/admin"
import { useCategories } from "@/hooks/queries/adminTables"
import { buildHref } from "@/utils/searchParams"
import type { Category } from "@/types"

import { CategoryFormDialog } from "./CategoryFormDialog"
import { DeleteCategoryDialog } from "./DeleteCategoryDialog"

export function CategoriesList({
  filters,
  initialData,
}: {
  filters: AdminCategoriesFilters
  initialData: Category[]
}) {
  const { data, error, isFetching } = useCategories(initialData)
  const t = useTranslations("admin.categories")
  const format = useFormat()
  const headings = [
    t("headingName"),
    // On phones the description moves under the name, so the row fits.
    { label: t("headingDescription"), className: "hidden md:table-cell" },
    { label: t("headingListings"), align: "right" },
    { label: t("headingActions"), align: "right" },
  ] as const

  if (error) {
    return <EmptyState>{error.message || t("loadError")}</EmptyState>
  }

  const all = data ?? []

  if (all.length === 0) {
    return <EmptyState>{t("empty")}</EmptyState>
  }

  const term = filters.searchTerm?.toLowerCase()
  const matches = term
    ? all.filter(
        (category) =>
          category.name.toLowerCase().includes(term) ||
          category.description?.toLowerCase().includes(term)
      )
    : all

  const totalPages = Math.max(1, Math.ceil(matches.length / ADMIN_PAGE_SIZE))
  const page = Math.min(filters.page, totalPages)
  const start = (page - 1) * ADMIN_PAGE_SIZE
  const categories = matches.slice(start, start + ADMIN_PAGE_SIZE)

  if (categories.length === 0) {
    return <EmptyState>{t("noMatch")}</EmptyState>
  }

  return (
    <>
      <DataTable
        headings={headings}
        count={{
          total: matches.length,
          one: t("countOne"),
          many: t("countMany"),
        }}
        isFetching={isFetching}
      >
        {categories.map((category) => {
          const listings = category._count?.gearItems ?? 0

          return (
            <TableRow key={category.id} className="hover:bg-transparent">
              <TableCell className="font-medium whitespace-normal">
                {category.name}
                {category.description && (
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground md:hidden">
                    {category.description}
                  </span>
                )}
              </TableCell>
              {/* Wraps instead of pushing Listings and Actions off the table. */}
              <TableCell className="hidden w-full min-w-56 whitespace-normal text-muted-foreground md:table-cell">
                {category.description || "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {listings > 0 ? (
                  <Link
                    href={`/gear?category=${category.id}`}
                    className="transition-colors hover:text-primary"
                  >
                    {format.number(listings)}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">
                    {format.number(0)}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <CategoryFormDialog category={category} />
                  <DeleteCategoryDialog category={category} />
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </DataTable>

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefFor={(next) =>
          buildHref(ADMIN_CATEGORIES_PATH, { ...filters, page: next })
        }
        label={t("pagination")}
      />
    </>
  )
}
