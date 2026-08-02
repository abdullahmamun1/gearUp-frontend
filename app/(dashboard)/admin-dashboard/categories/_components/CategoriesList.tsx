"use client"

import Link from "next/link"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { TableCell, TableRow } from "@/components/ui/table"
import { useCategories } from "@/lib/queries/adminTables"
import type { Category } from "@/types"

import { CategoryFormDialog } from "./CategoryFormDialog"
import { DeleteCategoryDialog } from "./DeleteCategoryDialog"

const HEADINGS = [
  "Name",
  "Description",
  { label: "Listings", align: "right" },
  { label: "Actions", align: "right" },
] as const

export function CategoriesList({ initialData }: { initialData: Category[] }) {
  const { data, error, isFetching } = useCategories(initialData)

  if (error) {
    return (
      <EmptyState>{error.message || "Couldn't load categories."}</EmptyState>
    )
  }

  const categories = data ?? []

  if (categories.length === 0) {
    return (
      <EmptyState>
        No categories yet. Providers can&apos;t list gear until there is at
        least one.
      </EmptyState>
    )
  }

  return (
    <DataTable
      headings={HEADINGS}
      count={{
        total: categories.length,
        one: "category",
        many: "categories",
      }}
      isFetching={isFetching}
    >
      {categories.map((category) => {
        const listings = category._count?.gearItems ?? 0

        return (
          <TableRow key={category.id} className="hover:bg-transparent">
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell className="max-w-md text-muted-foreground">
              {category.description || "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {listings > 0 ? (
                <Link
                  href={`/gear?category=${category.id}`}
                  className="transition-colors hover:text-primary"
                >
                  {listings}
                </Link>
              ) : (
                <span className="text-muted-foreground">0</span>
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
  )
}
