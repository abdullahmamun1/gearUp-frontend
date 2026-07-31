import Link from "next/link"

import { getCategories } from "@/app/(public)/_actions/getCategories"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { AdminMessage } from "../../_components/AdminMessage"

export async function CategoriesTable() {
  const res = await getCategories()

  if (!res.success) {
    return (
      <AdminMessage>
        {res.message || "Couldn't load categories. Please try again."}
      </AdminMessage>
    )
  }

  const categories = res.data ?? []

  if (categories.length === 0) {
    return (
      <AdminMessage>
        No categories yet. Providers can&apos;t list gear until there is at
        least one.
      </AdminMessage>
    )
  }

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        {categories.length}{" "}
        {categories.length === 1 ? "category" : "categories"}
      </p>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Listings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
